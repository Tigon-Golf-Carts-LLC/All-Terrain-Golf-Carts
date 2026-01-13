import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendContactEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  model: string | null;
  message: string;
}) {
  const modelLabels: Record<string, string> = {
    xt4: "EVolution D-MAX XT4 (4-Seat)",
    xt6: "EVolution D-MAX XT6 (6-Seat)",
    both: "Both Models",
    general: "General Inquiry",
  };

  const interestedIn = data.model ? modelLabels[data.model] || data.model : "Not specified";

  const emailHtml = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
    <p><strong>Interested In:</strong> ${interestedIn}</p>
    <hr />
    <p><strong>Message:</strong></p>
    <p>${data.message.replace(/\n/g, "<br>")}</p>
  `;

  const emailText = `
New Contact Form Submission

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}
Interested In: ${interestedIn}

Message:
${data.message}
  `;

  const recipients = ["sales@tigongolfcarts.com", "tigongolfcarts@gmail.com"];

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipients.join(", "),
    replyTo: data.email,
    subject: `New Contact Form: ${data.firstName} ${data.lastName} - ${interestedIn}`,
    text: emailText,
    html: emailHtml,
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: Date.now() });
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone || null,
        model: req.body.model || null,
        message: req.body.message,
      };

      const validatedData = insertContactSchema.parse(contactData);
      const submission = await storage.createContactSubmission(validatedData);
      
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          await sendContactEmail({
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email,
            phone: validatedData.phone ?? null,
            model: validatedData.model ?? null,
            message: validatedData.message,
          });
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
        }
      }
      
      res.status(201).json({ 
        success: true, 
        message: "Contact form submitted successfully",
        id: submission.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid form data", 
          errors: error.errors 
        });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit contact form" 
        });
      }
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch contact submissions" 
      });
    }
  });

  return httpServer;
}
