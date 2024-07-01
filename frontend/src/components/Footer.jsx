import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import '../App.css'



export default function Footer(){
    const currentYear = new Date().getFullYear();

    return (
        <>
        <div className="footer">
            <div className="footer-text">
                <p className="heading">About</p>
                <p>JOTTECH</p>
                <p>Terms of service</p>
                <p>Privacy policy</p>
            </div>
            <div className="footer-text">
                <p className="heading">Trending</p>
                <p>Most viewed</p>
                <p>Reders choice</p>
                <p>Feature blog</p>
            </div>
            <div className="footer-text">
                <p className="heading">Social</p>
                <p><FaYoutube/></p>
                <p><FaInstagram/></p>
                <p><FaFacebookF/></p>
            </div>
            <div className="copyright"><p>&copy; {currentYear} JOTTECH. All right reserved.</p></div>
        </div>
        
        </>
    );

}