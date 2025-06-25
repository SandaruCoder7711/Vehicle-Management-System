import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import './footer.css';

function CustomerFooter() {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* About Section */}
                <div className="footer-section">
                    <h3 className="footer-title">About Us</h3>
                    <p>AutoDrive Vehicle Management System is a cutting-edge solution designed to streamline vehicle operations for businesses and individuals.</p>
                </div>

                {/* Quick Links Section */}
                <div className="footer-section">
                    <h3 className="footer-title">Quick Links</h3>
                    <ul className="footer-links">
                        <li><a href="/">Home</a></li>
                        <li><a href="/contact-us">Contact Us</a></li>
                        <li><a href="/about-us">About Us</a></li>
                        <li><a href="/gallery">Gallery</a></li>
                    </ul>
                </div>

                {/* Contact & Social Media */}
                <div className="footer-section">
                    <h3 className="footer-title">Contact Us</h3>
                    <p>Email: autodrive@gmail.com</p>
                    <p>Phone: +94-51-2242863</p>

                    {/* Social Media Links */}
                    <div className="footer-social">
                        <a href="#" className="social-icon"><FaFacebookF /></a>
                        <a href="#" className="social-icon"><FaTwitter /></a>
                        <a href="#" className="social-icon"><FaInstagram /></a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} Auto Drive. All Rights Reserved.
            </div>
        </footer>
    );
}

export default CustomerFooter;
