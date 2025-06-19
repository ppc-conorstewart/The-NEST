// src/pages/SourcingPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './SourcingPage.css';
import { API } from '../api';

export default function SourcingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    category: 'All',
  });

  // If URL contains "?openForm=true", open the form automatically
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openForm') === 'true') {
      setShowForm(true);
    }
  }, [location.search]);

  // Form state
  const [formData, setFormData] = useState({
    base: '',
    neededBy: '',
    quantity: '',
    project: '',
    vendor: '',
    category: 'Other',
    priority: 'Medium',
    status: 'Requested',
    items: [{ description: '' }],
  });

  // Fetch tickets (with filters)
  const fetchTickets = async () => {
    try {
      const { status, priority, category } = filters;
      const params = {};
      if (status !== 'All') params.status = status;
      if (priority !== 'All') params.priority = priority;
      if (category !== 'All') params.category = category;
      const res = await axios.get(`${API}/api/sourcing`, { params });
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to load sourcing tickets:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  // Handle ticket-level inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle item description changes
  const handleItemChange = (index, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index].description = value;
      return { ...prev, items: newItems };
    });
  };

  // Add/remove item rows
  const addItemRow = () =>
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '' }],
    }));
  const removeItemRow = (index) =>
    setFormData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems.length ? newItems : [{ description: '' }] };
    });

  // Submit handler: create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const neededDate = new Date(formData.neededBy);
    if (isNaN(neededDate.getTime())) {
      setError('“Needed By” must be a valid date.');
      return;
    }
    for (let i = 0; i < formData.items.length; i++) {
      if (!formData.items[i].description.trim()) {
        setError('Each item requires a nonempty description.');
        return;
      }
    }
    try {
      if (editingId !== null) {
        await axios.put(
          `${API}/api/sourcing/${editingId}`,
          {
            base: formData.base,
            neededBy: formData.neededBy,
            quantity: formData.quantity,
            project: formData.project,
            vendor: formData.vendor,
            category: formData.category,
            priority: formData.priority,
            status: formData.status,
          }
        );
      } else {
        await Promise.all(
          formData.items.map((item) =>
            axios.post(
              `${API}/api/sourcing`,
              {
                base: formData.base,
                neededBy: formData.neededBy,
                quantity: formData.quantity,
                project: formData.project,
                vendor: formData.vendor,
                category: formData.category,
                priority: formData.priority,
                status: formData.status,
                itemDescription: item.description,
              }
            )
          )
        );
      }
      await fetchTickets();
      resetForm();
    } catch (err) {
      console.error('Failed to submit tickets:', err);
      setError(err.response?.data?.error || 'There was an error submitting the tickets.');
    }
  };

  // Prefill for editing
  const handleEditClick = (ticket) => {
    setEditingId(ticket.id);
    setFormData({
      base: ticket.base,
      neededBy: ticket.neededBy,
      quantity: ticket.quantity,
      project: ticket.project,
      vendor: ticket.vendor || '',
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      items: [{ description: ticket.itemDescription }],
    });
    setError('');
    setShowForm(true);
  };

  // Delete with confirmation
  const handleDelete = async (id) => {
    const confirmation = prompt(
      'Type DELETE (all caps) to confirm deletion of this ticket.'
    );
    if (confirmation !== 'DELETE') return;
    try {
      await axios.delete(`${API}/api/sourcing/${id}`);
      await fetchTickets();
    } catch {
      alert('Unable to delete. Please try again.');
    }
  };

  // Toggle form visibility
  const toggleForm = () => {
    resetForm();
    setShowForm(!showForm);
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      base: '',
      neededBy: '',
      quantity: '',
      project: '',
      vendor: '',
      category: 'Other',
      priority: 'Medium',
      status: 'Requested',
      items: [{ description: '' }],
    });
    setError('');
    setShowForm(false);
  };

  // Handle filter dropdowns
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Update expectedDate for a single ticket
  const handleExpectedDateChange = async (e, ticketId) => {
    const newDate = e.target.value; // yyyy-mm-dd
    try {
      const res = await axios.patch(
        `${API}/api/sourcing/${ticketId}`,
        { expectedDate: newDate }
      );
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? res.data : t))
      );
    } catch (err) {
      console.error('Failed to update expected date:', err);
      alert(
        err.response?.data?.error ||
          'There was an error updating the expected date.'
      );
    }
  };

  return (
    <div
      className="relative min-h-screen p-0 text-black"
      style={{
        backgroundImage: "url('/assets/dark-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h1 className="text-xl drop-shadow-[3px_0_3px_#6a7257] h-7 max-w-full flex items justify-center  border-2  rounded  border-black backdrop-blur-2xl font-bold  font-erbaum  text-center mb-4">
        SOURCING
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-center gap-4 mb-6 px-4">
        {['status','priority','category'].map((f) => (
          <div key={f}>
            <label className="text-white mr-2">
              Filter by {f.charAt(0).toUpperCase() + f.slice(1)}:
            </label>
            <select
              name={f}
              value={filters[f]}
              onChange={handleFilterChange}
              className="bg-black border border-gray-700 text-white px-2 py-1 rounded"
            >
              <option>All</option>
              {f === 'status' &&
                ['Requested','Ordered','Received','Cancelled'].map(o => (
                  <option key={o}>{o}</option>
                ))}
              {f === 'priority' &&
                ['High','Medium','Low'].map(o => <option key={o}>{o}</option>)}
              {f === 'category' &&
                ['Consumables','Equipment','Spare Parts','Other'].map(o => (
                  <option key={o}>{o}</option>
                ))}
            </select>
          </div>
        ))}
      </div>

      {/* Submit New Ticket Toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleForm}
          className="bg-black  hover:bg-red text-white border border-gray-600 font-bold px-5 py-2 rounded-md transition"
        >
          {showForm ? '− Cancel' : '+ Submit New Ticket'}
        </button>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div className="max-w-2xl mx-auto bg-black rounded-md p-6 mb-8">
          {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Base */}
            <div>
              <label className="block text-white mb-1">Which Base:</label>
              <select
                name="base"
                value={formData.base}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded"
              >
                <option value="" disabled>
                  Select a Base
                </option>
                <option>Grande Prairie</option>
                <option>Red Deer</option>
                <option>Nisku</option>
              </select>
            </div>

            {/* Needed By */}
            <div>
              <label className="block text-white mb-1">
                When It’s Needed By:
              </label>
              <input
                type="date"
                name="neededBy"
                value={formData.neededBy}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-white mb-1">Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="How many?"
                className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded"
              />
            </div>

            {/* Project / Vendor */}
            <div>
              <label className="block text-white mb-1">Project:</label>
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                placeholder="e.g. Project X"
                className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Vendor (optional):</label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                placeholder="e.g. Acme Supplies"
                className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded"
              />
            </div>

            {/* Category / Priority / Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-white mb-1">Category:</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded"
                >
                  <option>Consumables</option>
                  <option>Equipment</option>
                  <option>Spare Parts</option>
                  <option>Other</option>
                </select>
              </div>
              {/* Priority */}
              <div>
                <label className="block text-white mb-1">Priority:</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              {/* Status */}
              <div>
                <label className="block text-white mb-1">Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded"
                >
                  <option>Requested</option>
                  <option>Ordered</option>
                  <option>Received</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>

            {/* Items Section */}
            <div>
              <div className="flex justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Items</h3>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  + Add Item
                </button>
              </div>
              {formData.items.map((itm, idx) => (
                <div key={idx} className="bg-[#2a2a2a] p-4 rounded mb-4 relative">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      &times;
                    </button>
                  )}
                  <div>
                    <label className="block text-white mb-1">Item Description:</label>
                    <input
                      type="text"
                      value={itm.description}
                      onChange={(e) => handleItemChange(idx, e.target.value)}
                      placeholder="What item is needed?"
                      className="w-full bg-black border border-gray-700 text-white px-3 py-2 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-[#6a7257] hover:bg-[#0099CC] text-black font-bold px-5 py-2 rounded-md transition"
              >
                {editingId !== null ? 'Save Changes' : 'Submit Ticket(s)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Tickets Table */}
      <div className="mb-8 mx-4 flex justify-center">
        <div className="w-full ml-10 max-w-8xl border border-black bg-white bg-opacity-5 backdrop-blur-lg rounded-md">
          <h2 className="text-lg text-fly-blue drop-shadow-[0_0_2px_black] border border-black font-erbaum font-bold uppercase mb-0 px-0 pt-0 text-center">
            Current Tickets
          </h2>
          <div className="px-2 border pb-4 border-black overflow-x-auto">
            <table className="min-w-full my-2 text-center text-gray-400 bg-black text-left text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-2">Item</th>
                  <th className="px-2 py-2">Base</th>
                  <th className="px-2 py-2">Needed By</th>
                  <th className="px-2 py-2">Quantity</th>
                  <th className="px-2 py-2">Project</th>
                  <th className="px-2 py-2">Vendor</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Priority</th>
                  <th className="px-2 py-2">Expected Date</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Attachments</th>
                  <th className="px-2 py-2">Created At</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="odd:bg-[#222] even:bg-black">
                    <td className="px-2 text-xs font-bold py-2">{t.itemDescription}</td>
                    <td className="px-2 text-xs py-1">{t.base}</td>
                    <td className="px-2 text-xs py-1">{t.neededBy}</td>
                    <td className="px-2 text-xs py-1">{t.quantity}</td>
                    <td className="px-2 text-sm text-fly-blue font-bold py-1">{t.project}</td>
                    <td className="px-2 text-xs py-1">{t.vendor || '—'}</td>
                    <td className="px-2 text-xs py-1">{t.category}</td>
                    <td className="px-2 text-xs py-1">{t.priority}</td>
                    <td className="px-2 text-xs py-1">
                      <input
                        type="date"
                        value={t.expectedDate || ''}
                        onChange={(e) => handleExpectedDateChange(e, t.id)}
                        className="bg-black border text-xs border-gray-700 text-white px-2 py-1 rounded "
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1  text-sm font-bold  ${
                          t.status === 'Requested'
                            ? 'bg-yellow-500 text-black'
                            : t.status === 'Ordered'
                            ? 'bg-blue-500 text-white'
                            : t.status === 'Received'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {t.attachments?.length ? (
                        t.attachments.map((p, i) => (
                          <a
                            key={i}
                            href={p}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-[#6a7257] mr-2 text-xs"
                          >
                            View
                          </a>
                        ))
                      ) : (
                        <button className="bg-[#333] hover:bg-[#444] text-white px-2 py-1 rounded text-xs">
                          Upload
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="bg-yellow-500 px-2 py-1 rounded text-black mr-2 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="bg-red-600 px-2 py-1 rounded text-white text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Calendar Overview */}
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-xl text-fly-blue w-full flex justify-center  bg-black max-w-xs  justify-center rounded-top border-2 border-black font-erbaum font-bold font-erbaum uppercase text-fly-blue  mb-">Sourcing Calendar </h2>
        
        <div className="flex justify-center mx-auto border-4 border-black backdrop-blue-2xl w-[700px] ">
          <Calendar
            calendarType="US"
            className="my-calendar"
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const dString = date.toISOString().slice(0, 10);
                const found = tickets.find((t) => t.expectedDate === dString);
                return found ? (
                  <div className="tile-label">
                    {`${found.itemDescription} Delivery`}
                  </div>
                ) : null;
              }
              return null;
            }}
          />
        </div>
      </div>
    </div>
  );
}
