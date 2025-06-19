// src/pages/FlyHQ.jsx

import React, { useState, useEffect } from 'react';
import useAssets from '../hooks/useAssets';
import useActivityLog from '../hooks/useActivityLog';
import useFilteredPaginated from '../hooks/useFilteredPaginated';

import AddAssetModal from '../components/AddAssetModal';
import EditAssetModal from '../components/EditAssetModal';
import TransferModal from '../components/TransferModal';
import TransferSuccessModal from '../components/TransferSuccessModal';
import AssetTable from '../components/AssetTable';
import ActivityLogTable from '../components/ActivityLogTable';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

import { HEADER_LABELS, FILTER_KEYS } from '../constants/assetFields';

const logo = '/assets/flyhq-logo.png';
const camoBg = '/assets/dark-bg.jpg';

export default function FlyHQ() {
  // ---------- State ----------
  const [filters, setFilters] = useState({
    id: '',
    sn: '',
    name: '',
    category: '',
    location: '',
    status: '',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransferSuccess, setShowTransferSuccess] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [transferredAssets, setTransferredAssets] = useState([]);
  const [editAsset, setEditAsset] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [assetPendingDelete, setAssetPendingDelete] = useState(null);

  // ---------- Data Hooks ----------
  const { assets, fetchAssets } = useAssets();
  const { activityLogs, fetchActivityLogs } = useActivityLog();
  const { filtered } = useFilteredPaginated(
    assets,
    filters,
    sortConfig,
    currentPage,
    itemsPerPage
  );

  // ---------- Derived Data ----------
  const searched = filtered.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      (a.id || '').toLowerCase().includes(term) ||
      (a.sn || '').toLowerCase().includes(term) ||
      (a.name || '').toLowerCase().includes(term) ||
      (a.category || '').toLowerCase().includes(term) ||
      (a.location || '').toLowerCase().includes(term) ||
      (a.status || '').toLowerCase().includes(term)
    );
  });
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedWithSearch = searched
    .sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    })
    .slice(startIdx, startIdx + itemsPerPage);
  const totalPagesWithSearch = Math.ceil(searched.length / itemsPerPage);

  // ---------- Dropdown Option Lists ----------
  const idOptions = Array.from(new Set(assets.map((a) => a.id))).filter(Boolean);
  const snOptions = Array.from(new Set(assets.map((a) => a.sn))).filter(Boolean);
  const nameOptions = Array.from(new Set(assets.map((a) => a.name))).filter(Boolean);
  const categoryOptions = Array.from(new Set(assets.map((a) => a.category))).filter(Boolean);
  const locationOptions = Array.from(new Set(assets.map((a) => a.location))).filter(Boolean);
  const statusOptions = Array.from(new Set(assets.map((a) => a.status))).filter(Boolean);

  // Quick name lookup for activity-log rendering
  const assetNameMap = {};
  assets.forEach((a) => {
    assetNameMap[a.id] = a.name;
  });

  // ---------- Dynamic Title Logic ----------
  const { name: fName, location: fLocation, category: fCategory, status: fStatus, id: fId, sn: fSn } = filters;
  let displayTitle = 'All Assets';
  if (fName && fLocation) {
    displayTitle = (
      <>
        {fName}'s In <span className="text-yellow-400">{fLocation}</span>
      </>
    );
  } else if (fName) {
    displayTitle = fName;
  } else if (fLocation) {
    displayTitle = (
      <>
        Assets In <span className="text-yellow-400">{fLocation}</span>
      </>
    );
  } else {
    const otherFilters = [];
    if (fCategory) otherFilters.push(fCategory);
    if (fStatus) otherFilters.push(fStatus);
    if (fId) otherFilters.push(fId);
    if (fSn) otherFilters.push(fSn);
    if (otherFilters.length > 0) {
      displayTitle = otherFilters.join(' | ');
    }
  }

  // ---------- Handlers ----------
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };
  const toggleSelect = (id) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleSelectAll = () => {
    const idsOnPage = paginatedWithSearch.map((a) => a.id);
    setSelectedAssetIds((prev) =>
      prev.length === idsOnPage.length ? [] : idsOnPage
    );
  };
  const handleAddAsset = async (payload) => {
    try {
      await fetch('http://localhost:3001/api/assets', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setShowAddModal(false);
      await fetchAssets();
      await fetchActivityLogs();
    } catch (err) {
      console.error('Error creating asset:', err);
    }
  };
  const handleEditAsset = async (updated) => {
    try {
      const payload = {};
      if (updated.sn !== editAsset.sn) payload.sn = updated.sn;
      if (updated.name !== editAsset.name) payload.name = updated.name;
      if (updated.category !== editAsset.category) payload.category = updated.category;
      if (updated.status !== editAsset.status) payload.status = updated.status;
      if (updated.location !== editAsset.location) payload.location = updated.location;
      await fetch(
        `http://localhost:3001/api/assets/${encodeURIComponent(editAsset.id)}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      await fetch('http://localhost:3001/api/activity', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'Updated Asset',
          asset_id: editAsset.id,
          details: JSON.stringify(payload),
        }),
      });
      setEditAsset(null);
      await fetchAssets();
      await fetchActivityLogs();
    } catch (err) {
      console.error('Error updating asset:', err);
    }
  };
  const handleDeleteClick = (asset) => setAssetPendingDelete(asset);
  const confirmDelete = async () => {
    if (!assetPendingDelete) return;
    try {
      await fetch(
        `http://localhost:3001/api/assets/${encodeURIComponent(assetPendingDelete.id)}`,
        { method: 'DELETE', credentials: 'include' }
      );
      setAssetPendingDelete(null);
      await fetchAssets();
      await fetchActivityLogs();
    } catch (err) {
      console.error('Error deleting asset:', err);
    }
  };
  const cancelDelete = () => setAssetPendingDelete(null);
  const handleTransfer = async () => {
    if (!selectedAssetIds.length || !newLocation) return;
    try {
      const detailsObj = {
        items: selectedAssetIds.map((id) => ({ id, name: assetNameMap[id] })),
        newLocation,
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/assets/transfer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds: selectedAssetIds, newLocation }),
      });
      if (res.ok) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/activity`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'Transferred Multiple Assets',
            details: JSON.stringify(detailsObj),
          }),
        });
        setTransferredAssets(selectedAssetIds);
        setShowTransferModal(false);
        setSelectedAssetIds([]);
        setNewLocation('');
        await fetchAssets();
        setShowTransferSuccess(true);
        await fetchActivityLogs();
      }
    } catch (err) {
      console.error('Error transferring multiple assets:', err);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-transparent font-erbaum uppercase text-sm text-white bg-fixed bg-cover"
      style={{ backgroundImage: `url(${camoBg})` }}
   >
      {/* Header Section */}
      <div className="flex flex-col items-center mb-1 relative">
        <img src={logo} alt="FLY-HQ Logo" className="w-24 drop-shadow-xl mb-" />
        <h1 className="text-2xl font-bold mb-">Asset Management</h1>
        

        {/* Status Summary */}
        <div className="w-full max-w-lg scale-75 max-h-lg border-4 border-fly-blue rounded-xl mb- bg-black">
          <div className="px- py-1 flex justify-center">
            <span className="text-xl uppercase font-bold text-white">{displayTitle}</span>
          </div>
          <div className="rounded-b-sm">
            <div className="flex gap-4 justify-center items-center px-2 py-1">
              {/* Badges */}
              <div className="flex-1 bg-black rounded-md text-center border-4 border-teal-600">
                <div className="bg-teal-600 py- border-b-2 border-black">
                  <span className="uppercase text-black font-extrabold text-sm">Available</span>
                </div>
                <div className="py-">
                  <span className="text-teal-600 text-xl">
                    {filtered.filter((a) => a.status === 'Available').length}
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-black rounded-md text-center border-4 border-amber-500">
                <div className="bg-amber-500 py- border-b-2 border-black">
                  <span className="uppercase text-black font-extrabold text-sm">New</span>
                </div>
                <div className="py-">
                  <span className="text-amber-500  text-lg">
                    {filtered.filter((a) => a.status === 'New').length}
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-black rounded-md text-center border-4 border-indigo-600">
                <div className="bg-indigo-600 py- border-b-2 border-black">
                  <span className="uppercase text-black font-extrabold text-sm">In-Use</span>
                </div>
                <div className="py-">
                  <span className="text-indigo-600 font-erbaum text-lg">
                    {filtered.filter((a) => a.status === 'In-Use').length}
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-black rounded-md text-center border-4 border-white">
                <div className="bg-white py- border-b-2 border-black">
                  <span className="uppercase text-black font-extrabold text-sm">Total</span>
                </div>
                <div className="py-">
                  <span className="text-white  text-lg">{filtered.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2 mb-2">
          <button
          onClick={() => setShowActivityLog((prev) => !prev)}
          className=" bg-black text-white border-2 whitespace-nowrap border-[#6a7257] uppercase font-erbaum text-xs px-3 py-1 rounded shadow hover:bg-gray-800 transition"
        >
          {showActivityLog ? '← Back to Assets' : 'View Activity Log'}
        </button>
          <input
            type="text"
            placeholder="Search Assets"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mx-2  py-1 text-center uppercase  rounded border-2 border-[#6a7257] bg-black text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          
        </div>

        
      </div>

      {showActivityLog ? (
        // Activity Log View
        <div className="w-full backdrop-blur-xl border-4 border-black p-1 rounded-lg shadow-xl ">
          <h2 className="text-base font-bold text-white text-center mb-1">Activity Log</h2>
          <ActivityLogTable logs={activityLogs} assetNameMap={assetNameMap} condensed />
        </div>
      ) : (
        // Asset Table View
        <div className=" max-w-7xl justify-center ml-24 backdrop-blur-3xl border-2 border-fly-blue p-2 text-xs rounded-lg shadow-xl overflow-x-auto mb-2">
          <div className="flex flex-wrap  justify-center mb-2 gap-4">
            {FILTER_KEYS.map((key) => (
              <select
                key={key}
                className="bg-black text-white px-0 py-1 rounded border border-fly-blue"
                value={filters[key]}
                onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
              >
                <option value="">
                  All {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
                {({
                  id: idOptions,
                  sn: snOptions,
                  name: nameOptions,
                  category: categoryOptions,
                  location: locationOptions,
                  status: statusOptions,
                }[key] || []).map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            ))}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setShowTransferModal(true)}
                className="bg-black text-cyan-400 border border-cyan-400 font-bold px-5 py-2 rounded shadow hover:bg-gray-800 transition"
              >
                🚚 Asset Transfer
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-black text-cyan-400 border border-cyan-400 font-bold px-5 py-2 rounded shadow hover:bg-gray-800 transition"
              >
                + Add New Asset
              </button>
            </div>
          </div>

          <AssetTable
            assets={paginatedWithSearch}
            selectedIds={selectedAssetIds}
            onToggle={toggleSelect}
            onToggleAll={toggleSelectAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            headerLabels={HEADER_LABELS}
            onEdit={(asset) => setEditAsset(asset)}
            onDelete={handleDeleteClick}
            deleteButtonStyle={{
              backgroundColor: 'transparent',
              color: '#e53e3e',
              border: '1px solid #e53e3e',
              fontWeight: 'bold',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          />

          <div className="flex justify-between items-center p-4 border-t border-[#333] text-sm text-white">
            <span>Total Assets: {searched.length}</span>
            <div className="space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 bg-[#00BFFF] text-black rounded disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPagesWithSearch}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPagesWithSearch))}
                className="px-3 py-1 bg-[#00BFFF] text-black rounded disabled:opacity-50"
                disabled={currentPage === totalPagesWithSearch}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddAsset}
        nameOptions={nameOptions}
        categoryOptions={categoryOptions}
        locationOptions={locationOptions}
        statusOptions={statusOptions}
      />
      <EditAssetModal
        isOpen={!!editAsset}
        initialData={editAsset}
        onClose={() => setEditAsset(null)}
        onSave={handleEditAsset}
        nameOptions={nameOptions}
        categoryOptions={categoryOptions}
        locationOptions={locationOptions}
        statusOptions={statusOptions}
        buttonColor="#6a7257"
      />
      <TransferModal
        isOpen={showTransferModal}
        selectedCount={selectedAssetIds.length}
        onClose={() => setShowTransferModal(false)}
        locationOptions={locationOptions}
        newLocation={newLocation}
        onLocationChange={setNewLocation}
        onTransfer={handleTransfer}
      />
      <TransferSuccessModal
        isOpen={showTransferSuccess}
        transferredIds={transferredAssets}
        onClose={() => setShowTransferSuccess(false)}
      />
      <ConfirmDeleteModal
        isOpen={Boolean(assetPendingDelete)}
        asset={assetPendingDelete || {}}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
