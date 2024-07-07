const dotenv=require('dotenv')
const express = require ('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user');
const Post = require('./models/post');
const Image = require('./models/Image'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


dotenv.config();

const salt = bcrypt.genSaltSync(10);
const mongoUrl = process.env.MONGO_URL; 
const secret = process.env.SECRET; 
const jwtSecret = process.env.JWT_SECRET;

const app= express();

app.use(cors({credentials:true, origin:process.env.FRONTEND_URL || 'http://localhost:5173'}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(mongoUrl)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

  const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header
  
    if (!token) {
      return res.status(401).json({ message: 'JWT must be provided' });
    }
  
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      req.user = decoded; // Attach user data to request object
      next();
    });
  };
   
  app.post('/register', async (req, res) => {
    const { username, useremail, password } = req.body;
    try {
      const userDoc = await User.create({
        username,
        useremail,
        password: bcrypt.hashSync(password, salt),
      });
      res.json(userDoc);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const userDoc = await User.findOne({ username });
      if (!userDoc) return res.status(400).json('User not found');
  
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
        jwt.sign({ username, id: userDoc._id }, secret, { expiresIn: '1h' }, (err, token) => {
          if (err) throw err;
          res.cookie('token', token, { httpOnly: true }).json({
            id: userDoc._id,
            username,
          });
        });
      } else {
        res.status(400).json('Wrong credentials');
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
  app.post('/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true }).json('Logged out');
  });
  
  
  app.post('/post', upload.single('file'), async (req, res) => {
  
    try {
      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required.' });
      }
  
    const { originalname, buffer, mimetype } = req.file;
    const newImage = new Image({
      name: originalname,
      data: buffer,
      contentType: mimetype,
    });
    await newImage.save();
  
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
  
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newImage._id, // Save the image ID
        author: info.id,
      });
  
      res.json(postDoc);
    });
  }catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'An error occurred while creating the post.' });
  }
  });
  
  app.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
  
    const newImage = new Image({
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype
    });
  
    try {
      await newImage.save();
      res.send('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).send('Error uploading image');
    }
  });
  
  app.put('/post', upload.single('file'), async (req, res) => {
    try {
        let newCover = null;
        if (req.file) {
            const { originalname, buffer, mimetype } = req.file;
            const newImage = new Image({
                name: originalname,
                data: buffer,
                contentType: mimetype,
            });
            await newImage.save();
            newCover = newImage._id;
        }
  
        const { token } = req.cookies;
        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) return res.status(401).json({ error: 'Unauthorized' });
  
            const { id, title, summary, content } = req.body;
            const postDoc = await Post.findById(id);
            const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
            if (!isAuthor) return res.status(403).json({ error: 'Forbidden' });
  
            await postDoc.updateOne({
                title,
                summary,
                content,
                cover: newCover ? newCover : postDoc.cover,
            });
  
            res.json(postDoc);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  //Delete post
  
  app.delete('/post/:id', async (req, res) => {
    try {
      const { token } = req.cookies;
      const { id } = req.params;
  
      if (!token) return res.status(401).json({ error: 'No token provided' });
  
      jwt.verify(token, secret, {}, async (err, info) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
  
        const postDoc = await Post.findById(id);
        if (!postDoc) return res.status(404).json({ error: 'Post not found' });
  
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) return res.status(403).json({ error: 'Forbidden' });
  
        await Post.findByIdAndDelete(id);
        res.json({ message: 'Post deleted successfully' });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  //
  
  app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json('No token provided');
  
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) return res.status(403).json('Invalid token');
      res.json(info);
    });
  });
  
  app.get('/images/:id', async (req, res) => {
    try {
      const image = await Image.findById(req.params.id);
      if (!image) return res.status(404).json({ message: 'Image not found' });
      res.contentType(image.contentType);
      res.send(image.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
  app.get('/post', async (req, res) => {
    res.json(
      await Post.find()
        .populate('author', ['username'])
        .sort({ createdAt: -1 })
        .limit(10)
    );
  });
  
  app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  });
  
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

