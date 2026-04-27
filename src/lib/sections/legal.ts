import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const legalSections: SectionTemplate[] = [
    {
        id: "legal-tos",
        name: "Terms of Service Section",
        category: "Legal",
        previewImage: "/previews/legal/legal-tos.png",
        create: () => makeBlock("tos", {
            title: "Terms of Service",
            content: `
                <h4>
                    <b>
                        Welcome to Our Service. These Terms of Service govern your access to and use of our website, applications, and services (collectively, the 'Service'). By accessing or using the Service, you agree to be bound by these Terms.
                    </b>
                </h4>
                <br>
                2. Use of the Platform
                You agree to use the platform only for lawful purposes and in accordance with these terms. You must not misuse, disrupt, or attempt to gain unauthorized access to any part of the system.
                <br />
                3. Account Responsibility
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                <br />
                4. Data & Privacy
                We may collect and process data necessary to provide our services. By using the platform, you consent to such data handling in accordance with our privacy practices.
                <br />
                5. Third-Party Integrations
                The platform may integrate with third-party systems. We are not responsible for the availability, accuracy, or reliability of these external services.
                <br />
                6. Intellectual Property
                All content, branding, and technology on this platform are the property of the company and may not be copied, modified, or distributed without permission.
                <br />
                7. Limitation of Liability
                The platform is provided “as is” without warranties of any kind. We are not liable for any direct or indirect damages resulting from the use of the service.
                <br />
                8. Service Availability
                We strive to maintain uptime and reliability but do not guarantee uninterrupted access. Maintenance or updates may temporarily affect availability.
                <br />
                9. Termination
                We reserve the right to suspend or terminate access to the platform at any time for violations of these terms or misuse of the service.
                <br />
                10. Changes to Terms
                These terms may be updated from time to time. Continued use of the platform constitutes acceptance of any changes.
                <br />
                11. Contact Information
                If you have any questions about these Terms, please contact our support team.
            `,
        }),
    },
    {
        id: "legal-privacy",
        name: "Privacy Policy Section",
        category: "Legal",
        previewImage: "/previews/legal/legal-privacy.png",
        create: () => makeBlock("privacy", {
            title: "Privacy Policy",
            content: `
                <h4>
                    <b>
                        Welcome to Our Service. These Privacy Policy governs your access to and use of our website, applications, and services (collectively, the 'Service'). By accessing or using the Service, you agree to be bound by these Terms.
                    </b>
                </h4>
                <br>
                2. Use of the Platform
                You agree to use the platform only for lawful purposes and in accordance with these terms. You must not misuse, disrupt, or attempt to gain unauthorized access to any part of the system.
                <br />
                3. Account Responsibility
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                <br />
                4. Data & Privacy
                We may collect and process data necessary to provide our services. By using the platform, you consent to such data handling in accordance with our privacy practices.
                <br />
                5. Third-Party Integrations
                The platform may integrate with third-party systems. We are not responsible for the availability, accuracy, or reliability of these external services.
                <br />
                6. Intellectual Property
                All content, branding, and technology on this platform are the property of the company and may not be copied, modified, or distributed without permission.
                <br />
                7. Limitation of Liability
                The platform is provided “as is” without warranties of any kind. We are not liable for any direct or indirect damages resulting from the use of the service.
                <br />
                8. Service Availability
                We strive to maintain uptime and reliability but do not guarantee uninterrupted access. Maintenance or updates may temporarily affect availability.
                <br />
                9. Termination
                We reserve the right to suspend or terminate access to the platform at any time for violations of these terms or misuse of the service.
                <br />
                10. Changes to Terms
                These terms may be updated from time to time. Continued use of the platform constitutes acceptance of any changes.
                <br />
                11. Contact Information
                If you have any questions about these Terms, please contact our support team.
            `,
        }),
    },
    {
        id: "legal-about",
        name: "About Us Section",
        category: "Legal",
        previewImage: "/previews/legal/legal-about.png",
        create: () => makeBlock("about", {
            title: "About Us",
            content: `
                <h4>
                    <b>
                        Welcome to Our Service. These About Policy governs your access to and use of our website, applications, and services (collectively, the 'Service'). By accessing or using the Service, you agree to be bound by these Terms.
                    </b>
                </h4>
                <br>
                2. Use of the Platform
                You agree to use the platform only for lawful purposes and in accordance with these terms. You must not misuse, disrupt, or attempt to gain unauthorized access to any part of the system.
                <br />
                3. Account Responsibility
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                <br />
                4. Data & Privacy
                We may collect and process data necessary to provide our services. By using the platform, you consent to such data handling in accordance with our privacy practices.
                <br />
                5. Third-Party Integrations
                The platform may integrate with third-party systems. We are not responsible for the availability, accuracy, or reliability of these external services.
                <br />
                6. Intellectual Property
                All content, branding, and technology on this platform are the property of the company and may not be copied, modified, or distributed without permission.
                <br />
                7. Limitation of Liability
                The platform is provided “as is” without warranties of any kind. We are not liable for any direct or indirect damages resulting from the use of the service.
                <br />
                8. Service Availability
                We strive to maintain uptime and reliability but do not guarantee uninterrupted access. Maintenance or updates may temporarily affect availability.
                <br />
                9. Termination
                We reserve the right to suspend or terminate access to the platform at any time for violations of these terms or misuse of the service.
                <br />
                10. Changes to Terms
                These terms may be updated from time to time. Continued use of the platform constitutes acceptance of any changes.
                <br />
                11. Contact Information
                If you have any questions about these Terms, please contact our support team.
            `,
        }),
    },
];
