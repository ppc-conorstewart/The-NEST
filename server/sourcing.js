// server/sourcing.js

const fs = require('fs');
const path = require('path');

// In a production system, you'd use a real database (PostgreSQL, MongoDB, etc.).
// For now, we’ll just store everything in memory and write attachments to disk under /uploads.

let nextTicketId = 1;
const tickets = [];

/**
 * VALID STATUSES, PRIORITIES, CATEGORIES
 */
const VALID_STATUSES   = ['Requested', 'Ordered', 'Received', 'Cancelled'];
const VALID_PRIORITIES = ['High', 'Medium', 'Low'];
const VALID_CATEGORIES = ['Consumables', 'Equipment', 'Spare Parts', 'Other'];

module.exports = {
  /**
   * Return all tickets (copy to prevent external mutation)
   */
  getAllTickets() {
    return tickets.map((t) => ({ ...t }));
  },

  /**
   * Return a single ticket by ID
   */
  getTicketById(id) {
    return tickets.find((t) => t.id === id);
  },

  /**
   * Create a new ticket
   */
  addTicket({
    itemDescription,
    base,
    neededBy,
    quantity,
    project,
    vendor = '',
    category = 'Other',
    priority = 'Medium',
    status   = 'Requested',
    expectedDate = '',
  }) {
    // Validate enum values
    if (!VALID_PRIORITIES.includes(priority)) {
      throw new Error(`Invalid priority: ${priority}`);
    }
    if (!VALID_CATEGORIES.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const newTicket = {
      id: nextTicketId++,
      itemDescription,
      base,
      neededBy,         // YYYY-MM-DD
      quantity,
      project,
      vendor,           // e.g. "Acme Corp"
      category,         // e.g. "Consumables"
      priority,         // e.g. "High"
      status,           // e.g. "Requested"
      expectedDate,     // YYYY-MM-DD (optional)
      attachmentPaths: [],  // e.g. ["uploads/12345_file.pdf"]
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tickets.push(newTicket);
    return { ...newTicket };
  },

  /**
   * Update an existing ticket: merge in any provided fields
   */
  updateTicket(id, updates) {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) {
      throw new Error(`Ticket with ID ${id} not found.`);
    }

    // Validate enums if present
    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      throw new Error(`Invalid status: ${updates.status}`);
    }
    if (updates.priority && !VALID_PRIORITIES.includes(updates.priority)) {
      throw new Error(`Invalid priority: ${updates.priority}`);
    }
    if (updates.category && !VALID_CATEGORIES.includes(updates.category)) {
      throw new Error(`Invalid category: ${updates.category}`);
    }

    // Optional: validate date formats (YYYY-MM-DD)
    if (updates.expectedDate && !/^\d{4}-\d{2}-\d{2}$/.test(updates.expectedDate)) {
      throw new Error(`Invalid expectedDate format: ${updates.expectedDate}`);
    }
    if (updates.neededBy && !/^\d{4}-\d{2}-\d{2}$/.test(updates.neededBy)) {
      throw new Error(`Invalid neededBy format: ${updates.neededBy}`);
    }

    // Merge updates and bump updatedAt
    Object.assign(ticket, updates, { updatedAt: new Date().toISOString() });
    return { ...ticket };
  },

  /**
   * Delete a ticket (and any attachments on disk)
   */
  deleteTicket(id) {
    const idx = tickets.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error(`Ticket with ID ${id} not found.`);
    }

    // Remove attachments from disk
    const ticket = tickets[idx];
    ticket.attachmentPaths.forEach((relPath) => {
      const fullPath = path.join(__dirname, relPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    tickets.splice(idx, 1);
  },

  /**
   * Add a file attachment to a ticket
   */
  addAttachmentToTicket(id, filename, fileBuffer) {
    // Ensure /uploads directory exists
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Save file with a unique name
    const uniqueName = `${Date.now()}_${filename}`;
    const savePath   = path.join(uploadDir, uniqueName);
    fs.writeFileSync(savePath, fileBuffer);

    // Attach relative path to ticket
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) {
      throw new Error(`Ticket ${id} not found when adding attachment.`);
    }
    const relPath = path.relative(__dirname, savePath);
    ticket.attachmentPaths.push(relPath);
    ticket.updatedAt = new Date().toISOString();
    return relPath;
  },
};
