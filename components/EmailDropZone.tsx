/**
 * EmailDropZone Component
 *
 * A drag-and-drop component that accepts .eml files from Outlook.
 * When dropped, the email is parsed and processed as a workflow item
 * (order, task, or notification).
 *
 * Features:
 * - Accepts .eml files (from Outlook drag to desktop)
 * - Visual feedback on hover and drop
 * - Multiple file drops at once
 * - Automatic parsing and workflow integration
 * - Status cards showing processed emails
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Task,
  Quote,
  Invoice,
  Notification,
  Customer,
  Lead,
  Interaction,
} from "../types";
import { parseEmlFile, ParsedEmail } from "../utils/emlParser";
import { findCustomerByEmail } from "../utils/emailCustomerMapping";

// Check if running in Electron
declare global {
  interface Window {
    electronAPI?: {
      handleEmlFile: (filePath: string) => Promise<void>;
      handleOutlookDrag: (data: string) => Promise<void>;
      isElectron: boolean;
    };
  }
}

// Processed email result
interface ProcessedEmail {
  id: string;
  email: ParsedEmail;
  workflowType: "order" | "task" | "notification";
  workflowItemId?: string;
  timestamp: string;
  status: "success" | "error";
  message: string;
}

interface EmailDropZoneProps {
  // Workflow integration callbacks
  onCreateTask?: (task: Partial<Task>) => Promise<string | undefined>;
  onCreateOrder?: (orderData: any) => Promise<string | undefined>;
  onCreateNotification?: (
    notification: Partial<Notification>
  ) => Promise<string | undefined>;
  onCreateInteraction?: (
    interaction: Partial<Interaction>
  ) => Promise<string | undefined>;
  // Optional: pass existing arrays to check for duplicates
  existingTasks?: Task[];
  existingQuotes?: Quote[];
  existingInvoices?: Invoice[];
  existingCustomers?: Customer[];
  existingLeads?: Lead[];
  // Current user for interactions
  currentUserId?: string;
  // Callback voor wanneer email preview moet worden getoond
  onShowEmailPreview?: (email: ParsedEmail) => void;
}

export const EmailDropZone: React.FC<EmailDropZoneProps> = ({
  onCreateTask,
  onCreateOrder,
  onCreateNotification,
  onCreateInteraction,
  existingTasks = [],
  existingQuotes = [],
  existingInvoices = [],
  existingCustomers = [],
  existingLeads = [],
  currentUserId,
  onShowEmailPreview,
}) => {
  // State for drag-and-drop
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // State for processed emails to display feedback
  const [processedEmails, setProcessedEmails] = useState<ProcessedEmail[]>([]);

  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Determines the workflow type based on email content.
   * This is a simple heuristic and can be expanded.
   */
  const determineWorkflowType = useCallback(
    (email: ParsedEmail): "order" | "task" | "notification" => {
      const subjectLower = email.subject.toLowerCase();
      const bodyLower = email.body.toLowerCase();

      // Keywords for orders
      const orderKeywords = [
        "order",
        "bestel",
        "bestelling",
        "offerte",
        "quote",
        "prijs",
        "prijsofferte",
        "factuur",
        "invoice",
      ];
      // Keywords for tasks
      const taskKeywords = [
        "vraag",
        "question",
        "help",
        "hulp",
        "follow-up",
        "followup",
        "herinnering",
        "reminder",
        "actie",
        "action",
      ];

      const hasOrderKeyword = orderKeywords.some(
        (keyword) =>
          subjectLower.includes(keyword) || bodyLower.includes(keyword)
      );
      const hasTaskKeyword = taskKeywords.some(
        (keyword) =>
          subjectLower.includes(keyword) || bodyLower.includes(keyword)
      );

      if (hasOrderKeyword) {
        return "order";
      }
      if (hasTaskKeyword) {
        return "task";
      }
      return "notification";
    },
    []
  );

  /**
   * Finds or creates a customer/lead based on email address
   */
  const findOrCreateCustomer = useCallback(
    (email: string): { customerId?: string; leadId?: string } => {
      // First check email-customer mapping (from previous manual assignments)
      const mappedCustomerId = findCustomerByEmail(email);
      if (mappedCustomerId) {
        const customer = existingCustomers?.find(
          (c) => c.id === mappedCustomerId
        );
        if (customer) {
          return { customerId: customer.id };
        }
      }

      // Then check existing customers by primary email or emailAddresses
      const customer = existingCustomers?.find(
        (c) =>
          c.email.toLowerCase() === email.toLowerCase() ||
          c.emailAddresses?.some((e) => e.toLowerCase() === email.toLowerCase())
      );
      if (customer) {
        return { customerId: customer.id };
      }

      // Then check existing leads
      const lead = existingLeads?.find(
        (l) => l.email.toLowerCase() === email.toLowerCase()
      );
      if (lead) {
        return { leadId: lead.id };
      }

      // No match found - will be handled by callbacks
      return {};
    },
    [existingCustomers, existingLeads]
  );

  /**
   * Process email and create workflow item
   * This is the main integration point with the workflow system
   */
  const processEmail = useCallback(
    async (email: ParsedEmail): Promise<ProcessedEmail> => {
      const timestamp = new Date().toISOString();
      const id = `email_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      try {
        // Als er een preview callback is, gebruik die (altijd preview tonen)
        if (onShowEmailPreview) {
          onShowEmailPreview(email);
          return {
            id,
            email,
            workflowType: "notification", // Placeholder, wordt bepaald in modal
            timestamp,
            status: "success",
            message: `Email voorbereid voor verwerking: ${email.subject}`,
          };
        }

        // Fallback naar oude logica als geen preview callback
        const workflowType = determineWorkflowType(email);
        let workflowItemId: string | undefined;
        let message = "";

        // Find or get customer/lead info
        const customerInfo = findOrCreateCustomer(email.from);

        switch (workflowType) {
          case "order":
            // Create order workflow item
            if (onCreateOrder) {
              const orderData = {
                customerEmail: email.from,
                customerId: customerInfo.customerId,
                leadId: customerInfo.leadId,
                description: email.body,
                subject: email.subject,
                date: email.date || new Date().toISOString(),
              };
              workflowItemId = await onCreateOrder(orderData);
              message = `Order ontvangen van ${email.from}`;
            } else {
              message = `Order gedetecteerd van ${email.from} (createOrder callback niet beschikbaar)`;
            }
            break;

          case "task":
            // Create task workflow item
            if (onCreateTask) {
              const taskData: Partial<Task> = {
                title: email.subject || "Nieuwe taak",
                description: `Email van ${email.from}:\n\n${email.body}`,
                priority: "medium",
                status: "todo",
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
                customerId: customerInfo.customerId,
              };
              workflowItemId = await onCreateTask(taskData);
              message = `Taak aangemaakt van email: ${email.subject}`;
            } else {
              message = `Taak gedetecteerd: ${email.subject} (createTask callback niet beschikbaar)`;
            }
            break;

          case "notification":
            // Create notification workflow item
            if (onCreateNotification) {
              const notificationData: Partial<Notification> = {
                message: `${email.subject}: Van ${
                  email.from
                }: ${email.body.substring(0, 200)}${
                  email.body.length > 200 ? "..." : ""
                }`,
                type: "info",
                read: false,
                date: new Date().toISOString(),
              };
              workflowItemId = await onCreateNotification(notificationData);
              message = `Notificatie aangemaakt van ${email.from}`;
            } else {
              message = `Notificatie: ${email.subject} (createNotification callback niet beschikbaar)`;
            }
            break;
        }

        // Create interaction if callback is available
        if (onCreateInteraction && currentUserId) {
          await onCreateInteraction({
            type: "email",
            subject: email.subject,
            description: email.body,
            date: new Date().toISOString(),
            employeeId: currentUserId,
            customerId: customerInfo.customerId,
            leadId: customerInfo.leadId,
          });
        }

        return {
          id,
          email,
          workflowType,
          workflowItemId,
          timestamp,
          status: "success",
          message,
        };
      } catch (error) {
        console.error("Error processing email:", error);
        return {
          id,
          email,
          workflowType: "notification",
          timestamp,
          status: "error",
          message: `Fout bij verwerken: ${
            error instanceof Error ? error.message : "Onbekende fout"
          }`,
        };
      }
    },
    [
      determineWorkflowType,
      onCreateOrder,
      onCreateTask,
      onCreateNotification,
      onCreateInteraction,
      findOrCreateCustomer,
      currentUserId,
      onShowEmailPreview,
    ]
  );

  // Listen for Electron events when running in Electron
  useEffect(() => {
    console.log("🔍 EmailDropZone: Checking for Electron...");
    console.log("🔍 window.electronAPI:", window.electronAPI);
    console.log("🔍 isElectron:", window.electronAPI?.isElectron);

    if (typeof window !== "undefined" && window.electronAPI?.isElectron) {
      console.log("✅ Electron detected! Setting up event listeners...");

      // Also listen for drops on document level (in case drop zone doesn't catch it)
      const handleDocumentDrop = (e: DragEvent) => {
        console.log("📬 Document drop event!");
        const types = Array.from(e.dataTransfer?.types || []);
        console.log("📬 Document drop types:", types);

        if (
          types.includes("maillistrow") ||
          types.includes("application/x-outlook-item")
        ) {
          console.log("📬 Document: Outlook drag detected!");
          try {
            const data =
              e.dataTransfer?.getData("maillistrow") ||
              e.dataTransfer?.getData("application/x-outlook-item");
            console.log(
              "📬 Document: Outlook data:",
              data ? data.substring(0, 200) : "NO DATA"
            );
            if (data && window.electronAPI?.isElectron) {
              console.log("📬 Document: Calling handleOutlookDrag");
              e.preventDefault();
              e.stopPropagation();
              window.electronAPI.handleOutlookDrag(data);
            }
          } catch (error) {
            console.error("❌ Document: Error handling Outlook drag:", error);
          }
        }
      };

      const handleDocumentDragOver = (e: DragEvent) => {
        if (e.dataTransfer?.types.includes("maillistrow")) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener("drop", handleDocumentDrop);
      document.addEventListener("dragover", handleDocumentDragOver);
      console.log("✅ Document-level drop listeners added");

      const handleEmailDropped = async (event: CustomEvent) => {
        console.log("📬 React: email-dropped event received!");
        console.log("📬 Event detail:", event.detail);
        console.log("📬 Event type:", event.detail.type);

        setIsProcessing(true);
        try {
          if (event.detail.type === "eml") {
            console.log("📧 Processing .eml file...");
            // Handle .eml file content
            const parsedEmail = parseEmlFile(event.detail.content);
            console.log(
              "📧 Parsed email:",
              parsedEmail.from,
              parsedEmail.subject
            );
            if (parsedEmail.from && parsedEmail.subject) {
              const result = await processEmail(parsedEmail);
              console.log("✅ Email processed successfully:", result.status);
              setProcessedEmails((prev) => [result, ...prev]);
            } else {
              console.error("❌ Parsed email missing from or subject");
            }
          } else if (event.detail.type === "outlook") {
            console.log("📬 Processing Outlook email...");
            // Handle Outlook drag data
            const emailData = event.detail.emailData;
            console.log("📬 Email data:", emailData);
            if (emailData.from || emailData.subject) {
              const parsedEmail: ParsedEmail = {
                from: emailData.from || "unknown@example.com",
                to: Array.isArray(emailData.to)
                  ? emailData.to
                  : emailData.to
                  ? [emailData.to]
                  : [],
                subject: emailData.subject || "Geen onderwerp",
                body: emailData.body || "",
                date: emailData.date,
              };
              console.log("📬 Created ParsedEmail:", parsedEmail);
              const result = await processEmail(parsedEmail);
              console.log("✅ Email processed successfully:", result.status);
              setProcessedEmails((prev) => [result, ...prev]);
            } else {
              console.error("❌ Email data missing from and subject");
            }
          } else {
            console.error("❌ Unknown event detail type:", event.detail.type);
          }
        } catch (error) {
          console.error("❌ Error handling dropped email:", error);
          setProcessedEmails((prev) => [
            {
              id: `error_${Date.now()}`,
              email: { from: "", to: [], subject: "Error", body: "" },
              workflowType: "notification",
              timestamp: new Date().toISOString(),
              status: "error",
              message: `Fout bij verwerken: ${
                error instanceof Error ? error.message : "Onbekende fout"
              }`,
            },
            ...prev,
          ]);
        } finally {
          setIsProcessing(false);
        }
      };

      const handleEmailError = (event: CustomEvent) => {
        console.error(
          "❌ React: email-error event received:",
          event.detail.error
        );
        setProcessedEmails((prev) => [
          {
            id: `error_${Date.now()}`,
            email: { from: "", to: [], subject: "Error", body: "" },
            workflowType: "notification",
            timestamp: new Date().toISOString(),
            status: "error",
            message: event.detail.error || "Onbekende fout",
          },
          ...prev,
        ]);
      };

      window.addEventListener(
        "email-dropped",
        handleEmailDropped as EventListener
      );
      window.addEventListener("email-error", handleEmailError as EventListener);

      console.log("✅ Event listeners registered");

      return () => {
        window.removeEventListener(
          "email-dropped",
          handleEmailDropped as EventListener
        );
        window.removeEventListener(
          "email-error",
          handleEmailError as EventListener
        );
        document.removeEventListener("drop", handleDocumentDrop);
        document.removeEventListener("dragover", handleDocumentDragOver);
      };
    } else {
      console.log(
        "ℹ️ Not running in Electron, skipping Electron event listeners"
      );
    }
  }, [processEmail]);

  /**
   * Handle files dropped onto the component.
   * Supports multiple .eml files.
   */
  const handleFileDrop = useCallback(
    async (files: FileList) => {
      setIsProcessing(true);
      const results: ProcessedEmail[] = [];

      for (const file of Array.from(files)) {
        // Check if it's an .eml file
        if (
          file.name.endsWith(".eml") ||
          file.type === "message/rfc822" ||
          file.type === ""
        ) {
          try {
            const text = await file.text();
            const parsedEmail = parseEmlFile(text);

            // Validate parsed email
            if (!parsedEmail.from || !parsedEmail.subject) {
              results.push({
                id: `error_${Date.now()}`,
                email: parsedEmail,
                workflowType: "notification",
                timestamp: new Date().toISOString(),
                status: "error",
                message: `Ongeldig email formaat in ${file.name}. Van of onderwerp ontbreekt.`,
              });
              continue;
            }

            const result = await processEmail(parsedEmail);
            results.push(result);
          } catch (error) {
            results.push({
              id: `error_${Date.now()}`,
              email: { from: "", to: [], subject: file.name, body: "" },
              workflowType: "notification",
              timestamp: new Date().toISOString(),
              status: "error",
              message: `Fout bij lezen van ${file.name}: ${
                error instanceof Error ? error.message : "Onbekende fout"
              }`,
            });
          }
        } else {
          // Not an .eml file
          results.push({
            id: `error_${Date.now()}`,
            email: { from: "", to: [], subject: file.name, body: "" },
            workflowType: "notification",
            timestamp: new Date().toISOString(),
            status: "error",
            message: `${file.name} is geen .eml bestand. Sleep een email vanuit Outlook naar je desktop en gebruik dat bestand.`,
          });
        }
      }

      // Add results to processed emails list
      setProcessedEmails((prev) => [...results, ...prev]);
      setIsProcessing(false);
    },
    [processEmail]
  );

  /**
   * Drag event handlers
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if leaving the entire drop zone, not just a child element
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy"; // Indicate that data will be copied
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      console.log("📬 EmailDropZone: handleDrop called");
      console.log("📬 DataTransfer types:", Array.from(e.dataTransfer.types));
      console.log("📬 Files:", e.dataTransfer.files.length);

      // CRITICAL: Get data BEFORE preventDefault()!
      // Check for Outlook drag data FIRST
      const types = Array.from(e.dataTransfer.types);
      console.log("📬 Checking types:", types);

      if (
        types.includes("maillistrow") ||
        types.includes("application/x-outlook-item")
      ) {
        console.log("📬 EmailDropZone: Outlook drag detected!");
        try {
          // Get data BEFORE preventDefault - this is critical!
          const data =
            e.dataTransfer.getData("maillistrow") ||
            e.dataTransfer.getData("application/x-outlook-item");
          console.log(
            "📬 EmailDropZone: Outlook data:",
            data ? data.substring(0, 200) : "NO DATA"
          );

          if (data && window.electronAPI?.isElectron) {
            console.log("📬 EmailDropZone: Calling handleOutlookDrag");
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            await window.electronAPI.handleOutlookDrag(data);
            return; // Don't process as file
          } else if (!data) {
            console.error(
              "❌ EmailDropZone: No data received from Outlook drag"
            );
          }
        } catch (error) {
          console.error(
            "❌ EmailDropZone: Error handling Outlook drag:",
            error
          );
        }
      }

      // Prevent default for file drops
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false); // Reset drag state

      // Handle file drops
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        console.log("📁 EmailDropZone: File drop detected");
        await handleFileDrop(e.dataTransfer.files);
      } else {
        console.log("❌ EmailDropZone: No files and no Outlook data");
      }
    },
    [handleFileDrop]
  );

  /**
   * Handle file input change (for manual file selection)
   */
  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        await handleFileDrop(e.target.files);
        // Reset file input to allow dropping the same file again
        e.target.value = "";
      }
    },
    [handleFileDrop]
  );

  return (
    <div className="space-y-6">
      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDragOver(e);
        }}
        onDrop={handleDrop}
        className={`
          relative p-8 border-2 rounded-lg text-center transition-all duration-200
          ${
            isDragging
              ? "border-blue-500 bg-blue-50 shadow-lg"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }
        `}
        style={{
          minHeight: "200px",
          // Ensure drop zone can receive events
          pointerEvents: "auto",
        }}
      >
        <div className="text-5xl mb-4">{isDragging ? "✨" : "📧"}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {isDragging
            ? "Laat maar vallen!"
            : typeof window !== "undefined" && window.electronAPI?.isElectron
            ? "Sleep hier je Outlook email"
            : "Sleep hier je .eml bestanden"}
        </h3>
        <p className="text-gray-600 mb-2">
          {typeof window !== "undefined" && window.electronAPI?.isElectron
            ? "Sleep direct een email vanuit Outlook hierheen!"
            : "Sleep één of meerdere .eml bestanden hierheen."}
        </p>
        {(typeof window === "undefined" || !window.electronAPI?.isElectron) && (
          <p className="text-sm text-gray-500 mb-4">
            💡 <strong>Tip:</strong> Sleep een email vanuit Outlook naar je
            desktop om een .eml bestand te krijgen, sleep dat bestand dan
            hierheen. Of gebruik de Electron app voor directe Outlook
            integratie.
          </p>
        )}

        {/* File Input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".eml,message/rfc822"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Action Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isProcessing}
        >
          📁 Selecteer .eml Bestand
        </button>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Email verwerken...</p>
            </div>
          </div>
        )}
      </div>

      {/* Processed Emails List */}
      {processedEmails.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800">
            Verwerkte Emails ({processedEmails.length})
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {processedEmails.map((processed) => (
              <div
                key={processed.id}
                className={`
                  p-4 rounded-lg border-l-4
                  ${
                    processed.status === "success"
                      ? "bg-green-50 border-green-500"
                      : "bg-red-50 border-red-500"
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {processed.status === "success" ? "✅" : "❌"}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {processed.email.subject || "Geen onderwerp"}
                      </span>
                      <span
                        className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${
                          processed.workflowType === "order"
                            ? "bg-blue-100 text-blue-800"
                            : ""
                        }
                        ${
                          processed.workflowType === "task"
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          processed.workflowType === "notification"
                            ? "bg-purple-100 text-purple-800"
                            : ""
                        }
                      `}
                      >
                        {processed.workflowType === "order" ? "📦 Order" : ""}
                        {processed.workflowType === "task" ? "✓ Taak" : ""}
                        {processed.workflowType === "notification"
                          ? "🔔 Notificatie"
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Van:</strong> {processed.email.from}
                    </p>
                    {processed.email.to && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Naar:</strong>{" "}
                        {Array.isArray(processed.email.to)
                          ? processed.email.to.join(", ")
                          : processed.email.to}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 mb-2">
                      {processed.email.body.substring(0, 150)}
                      {processed.email.body.length > 150 ? "..." : ""}
                    </p>
                    <p className="text-xs text-gray-500">{processed.message}</p>
                    {processed.workflowItemId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Workflow ID: {processed.workflowItemId}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 ml-4">
                    {new Date(processed.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
