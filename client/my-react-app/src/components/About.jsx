import React from "react";
import "./About.css"; // Import the CSS file

const About = () => {
  return (
    <div className="about-container">
      <h1>About</h1>
      <p>Welcome to Destination Finder!</p>
      <p>This application can help you find your dream destinations in Europe.</p>
      <p>Created By Kyle Burley</p>

      <div className="policy-container">
        <h2>Security and Privacy Policy</h2>
        <p>
          At Destination Finder, we prioritize the security and privacy of our users. Below are the measures and policies we have implemented to safeguard your information:
        </p>

        <h3>Data Collection</h3>
        <p>
          - We collect only the necessary data required for the functionality of our application, including your email, username, and saved lists.
        </p>
        <p>
          - No sensitive financial or payment information is collected or stored on our servers.
        </p>

        <h3>Data Usage</h3>
        <p>
          - Your personal information is used solely to provide and improve the services offered by Destination Finder.
        </p>
        <p>
          - We do not sell, rent, or share your data with third parties without your explicit consent.
        </p>

        <h3>Data Security</h3>
        <p>
          - We employ industry-standard security measures, including encryption and secure communication channels, to protect your data from unauthorized access.
        </p>
        <p>
          - Regular security audits are conducted to ensure the integrity of our systems.
        </p>

        <h3>Cookies and Tracking</h3>
        <p>
          - Cookies are used to enhance your user experience. These cookies are not used to track your activity outside of Destination Finder.
        </p>
        <p>
          - You can manage cookie preferences in your browser settings.
        </p>

        <h3>Your Rights</h3>
        <p>
          - You have the right to access, update, or delete your personal data stored with us. Please contact our support team for assistance.
        </p>

        <h3>Policy Updates</h3>
        <p>
          - Our security and privacy policy may be updated periodically. Changes will be communicated to users through the application or email.
        </p>

        <h3>Contact Us</h3>
        <p>
          If you have any questions or concerns about our security and privacy practices, please feel free to contact us at <a href="mailto:support@destinationfinder.com">support@destinationfinder.com</a>.
        </p>
      </div>

      <div className="policy-container">
        <h2>Acceptable Use Policy</h2>
        <p>
          The Acceptable Use Policy (AUP) outlines the terms and conditions for using Destination Finder. By accessing and using our application, you agree to the following guidelines:
        </p>

        <h3>Prohibited Activities</h3>
        <p>
          - Do not use the application for any illegal or unauthorized purpose.
        </p>
        <p>
          - Do not attempt to hack, disrupt, or otherwise interfere with the operation of Destination Finder.
        </p>
        <p>
          - Do not share, upload, or distribute content that is abusive, defamatory, or discriminatory.
        </p>
        <p>
          - Do not misuse the search features by performing excessive or malicious queries to overload the system.
        </p>

        <h3>User Responsibilities</h3>
        <p>
          - Ensure that the information you provide, including your email and username, is accurate and up to date.
        </p>
        <p>
          - Respect the intellectual property rights of others, including the content provided through Destination Finder.
        </p>
        <p>
          - Use the application in compliance with all applicable laws and regulations.
        </p>

        <h3>Monitoring and Enforcement</h3>
        <p>
          - We reserve the right to monitor activity on the platform to ensure compliance with this AUP.
        </p>
        <p>
          - Violations of this policy may result in account suspension or termination without notice.
        </p>

        <h3>Reporting Violations</h3>
        <p>
          - If you become aware of any violations of this AUP, please report them to our support team at <a href="mailto:support@destinationfinder.com">support@destinationfinder.com</a>.
        </p>
      </div>
      <div className="policy-container">
        <h2>DMCA Notice & Takedown Policy</h2>
        <p>
          Destination Finder respects intellectual property rights and complies with applicable copyright laws. This policy explains how to report copyright infringement and how we handle such reports.
        </p>

        <h3>Filing a DMCA Notice</h3>
        <p>
          If you believe content on Destination Finder infringes your copyright, please provide the following information in your notice:
        </p>
        <ul>
          <li>
            A description of the copyrighted work you claim is infringed.
          </li>
          <li>
            A description of where the infringing content is located on Destination Finder (e.g., a link to the content).
          </li>
          <li>
            Your full name, address, phone number, and email address.
          </li>
          <li>
            A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.
          </li>
          <li>
            A statement that the information you have provided is accurate, and under penalty of perjury, that you are the copyright owner or authorized to act on behalf of the copyright owner.
          </li>
          <li>
            Your electronic or physical signature.
          </li>
        </ul>
        <p>
          Submit your notice to our DMCA agent at: <a href="mailto:dmca@destinationfinder.com">dmca@destinationfinder.com</a>
        </p>

        <h3>Processing a DMCA Notice</h3>
        <p>
          Upon receiving a valid DMCA notice, we will:
        </p>
        <ul>
          <li>Review the complaint for completeness and accuracy.</li>
          <li>Remove or disable access to the infringing content if the notice is valid.</li>
          <li>Notify the user who posted the content about the removal.</li>
        </ul>

        <h3>Filing a Counter-Notice</h3>
        <p>
          If you believe your content was removed in error, you may submit a counter-notice including:
        </p>
        <ul>
          <li>Your contact information (full name, address, phone number, and email).</li>
          <li>A description of the content that was removed and its location before removal.</li>
          <li>
            A statement, under penalty of perjury, that you have a good faith belief that the content was removed due to a mistake or misidentification.
          </li>
          <li>
            Your agreement to the jurisdiction of the courts in your location and your acceptance of service of process from the person who filed the original DMCA notice.
          </li>
          <li>Your electronic or physical signature.</li>
        </ul>
        <p>
          Submit your counter-notice to our DMCA agent at: <a href="mailto:dmca@destinationfinder.com">dmca@destinationfinder.com</a>
        </p>
        <p>
          Filing false DMCA notices or counter-notices may result in legal consequences. Please ensure your claims are accurate and made in good faith.
        </p>
      </div>
      <div className="policy-container">
        <h3>Important Note</h3>
        
        <strong>
          These emails addreses are not real please don't Email them!
        </strong>
      </div>
    </div>
  );
};

export default About;