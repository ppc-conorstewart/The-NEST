// src/components/WorkorderForm.jsx

import React, { useState, useEffect, useMemo } from 'react';
import useAssets from '../hooks/useAssets';
import WOInfoPage from './WOInfoPage';
import BOMPage from './BOMPage';
import DFITPage from './DFITPage';
import UpperMasterAssemblyPage from './UpperMasterAssemblyPage';
import NotesPage from './NotesPage';
import WorkorderHeader from './WorkorderHeader';
import WorkorderFooter from './WorkorderFooter';
import AlertsModal from './AlertsModal';

export default function WorkorderForm({ initialData, onClose }) {
  const { pages, logoUrl, customer, surfaceLSD } = initialData;
  const dfitTabs = ['DFIT-1', 'DFIT-2'];
  const umaTabs = ['UMA-1', 'UMA-2'];
  const { assets } = useAssets();

  const jobKey = `${customer.replace(/\s+/g, '-')}_${surfaceLSD}`;
  const storageKey = `workorderProgress_${jobKey}`;

  const [metadata, setMetadata] = useState({
    customer,
    surfaceLSD,
    numberOfWells: initialData.numberOfWells,
    rigInDate: initialData.rigInDate,
    wellBankType: initialData.wellBankType,
    workbookRevision: initialData.workbookRevision,
    buildingBase: initialData.buildingBase || ''
  });

  const [dfitSelections, setDfitSelections] = useState(() =>
    dfitTabs.map(() => {
      const sel = {};
      for (let i = 1; i <= 3; i++) sel[`location${i}`] = '';
      return sel;
    })
  );
  const [dfitBuildQtys, setDfitBuildQtys] = useState(() => {
    const qty = metadata.numberOfWells || 0;
    return dfitTabs.map((_, i) => (i === 0 ? qty : 0));
  });

  const [umaSelections, setUmaSelections] = useState(() =>
    umaTabs.map(() => {
      const sel = {};
      for (let i = 1; i <= 7; i++) sel[`location${i}`] = '';
      return sel;
    })
  );
  const [umaBuildQtys, setUmaBuildQtys] = useState(() => umaTabs.map(() => 0));

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [dfitActiveTab, setDfitActiveTab] = useState(0);
  const [umaActiveTab, setUmaActiveTab] = useState(0);

  const [bomItemsState, setBomItemsState] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [dfitTabConsumables, setDfitTabConsumables] = useState(() =>
    dfitTabs.map(() => ({ gaskets: [], boltups: [] }))
  );

  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const saved = JSON.parse(raw);

    setMetadata(saved.metadata || metadata);
    setDfitSelections(saved.dfitSelections || dfitSelections);
    setDfitBuildQtys(saved.dfitBuildQtys || dfitBuildQtys);
    setUmaSelections(saved.umaSelections || umaSelections);
    setUmaBuildQtys(saved.umaBuildQtys || umaBuildQtys);
    setCurrentPageIndex(saved.currentPageIndex ?? currentPageIndex);
    setDfitActiveTab(saved.dfitActiveTab ?? dfitActiveTab);
    setUmaActiveTab(saved.umaActiveTab ?? umaActiveTab);
    setConsumables(saved.consumables || consumables);
    setDfitTabConsumables(saved.dfitTabConsumables || dfitTabs.map(() => ({ gaskets: [], boltups: [] })));

    const items = [];
    const collect = (sels, bqs) => {
      sels.forEach((sel, ti) => {
        const mult = bqs[ti] || 1;
        Object.values(sel)
          .filter((v) => v)
          .forEach((desc) => {
            const found = items.find((i) => i.description === desc);
            if (found) found.quantity += mult;
            else items.push({ description: desc, quantity: mult });
          });
      });
    };
    collect(saved.dfitSelections || dfitSelections, saved.dfitBuildQtys || dfitBuildQtys);
    collect(saved.umaSelections || umaSelections, saved.umaBuildQtys || umaBuildQtys);
    setBomItemsState(items);
  }, [storageKey]);

  const addConsumable = (name, qty, page, tab) => {
    setConsumables((prev) => {
      const filtered = prev.filter((c) => !(c.name === name && c.page === page && c.tab === tab));
      return [...filtered, { name, qty, page, tab }];
    });
  };

  const handleSave = () => {
    // Compile fresh list of consumables from tab data
    const compiled = [];

    dfitTabConsumables.forEach((group, tab) => {
      group.gaskets.forEach((g) => compiled.push({ name: g.code, qty: g.qty, page: 'DFIT', tab }));
      group.boltups.forEach((b) => compiled.push({ name: b.code, qty: b.qty, page: 'DFIT', tab }));
    });

    const filtered = compiled.filter((c) => c.qty > 0);
    setConsumables(filtered);

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        metadata,
        dfitSelections,
        dfitBuildQtys,
        umaSelections,
        umaBuildQtys,
        currentPageIndex,
        dfitActiveTab,
        umaActiveTab,
        consumables: filtered,
        dfitTabConsumables
      })
    );
    alert('Progress saved!');
  };

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((i) => i - 1);
    }
  };

  const handleMetaChange = (field, value) =>
    setMetadata((m) => ({ ...m, [field]: value }));

  const handleDFITChange = (lk, value) =>
    setDfitSelections((arr) =>
      arr.map((sel, i) => (i === dfitActiveTab ? { ...sel, [lk]: value } : sel))
    );

  const handleUMAChange = (lk, value) =>
    setUmaSelections((arr) =>
      arr.map((sel, i) => (i === umaActiveTab ? { ...sel, [lk]: value } : sel))
    );

  const alerts = useMemo(() => {
    const out = [];
    const base = metadata.buildingBase;
    if (!base) return out;
    const onHand = (name) =>
      assets.filter(
        (a) =>
          a.name === name &&
          a.location === base &&
          a.status === 'Available'
      ).length;

    [
      { sels: dfitSelections, qtys: dfitBuildQtys, tab: 'DFIT' },
      { sels: umaSelections, qtys: umaBuildQtys, tab: 'UMA' }
    ].forEach(({ sels, qtys, tab }) => {
      sels.forEach((selObj, ti) => {
        const need = qtys[ti] || 0;
        Object.entries(selObj).forEach(([lk, name]) => {
          if (!name) return;
          const have = onHand(name);
          if (need > have) {
            out.push(
              `Insufficient "${name}" in ${base} for ${tab} tab #${ti + 1}, ` +
              `location ${lk.replace('location', '')}: need ${need}, have ${have}. ` +
              `Consider transferring assets.`
            );
          }
        });
      });
    });
    return out;
  }, [
    metadata.buildingBase,
    assets,
    dfitSelections,
    dfitBuildQtys,
    umaSelections,
    umaBuildQtys
  ]);

  let woNumber = '';
  if (currentPageIndex === 2) {
    const code = pages[2].code;
    const letter = String.fromCharCode(65 + dfitActiveTab);
    woNumber = `WO #${code}${letter}`;
  } else if (currentPageIndex === 3) {
    const code = pages[3].code;
    woNumber =
      umaActiveTab === 0
        ? `WO #${code}`
        : `WO #${code}${String.fromCharCode(65 + umaActiveTab)}`;
  }

  const prevLabel =
    currentPageIndex > 0 ? pages[currentPageIndex - 1].title : '';
  const nextLabel =
    currentPageIndex < pages.length - 1
      ? pages[currentPageIndex + 1].title
      : '';
  const canNext = currentPageIndex < pages.length - 1;

  const computedLogoSrc =
    logoUrl ||
    `/assets/logos/${metadata.customer.replace(/\s+/g, '-').toLowerCase()}.png`;

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        style={{ fontFamily: 'Erbaum, sans-serif', fontWeight: 'bold' }}
      >
        {/* <-- updated wrapper: larger max-width + fixed height */}
        <div className="bg-black border text-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
          
          <div className="flex justify-center items-center py-1 px-2 gap-1 bg-[#1a1a1a] border-b border-[#6a7257]">
            {pages.map((p, i) => (
              <button
                key={i}
                onClick={() => setCurrentPageIndex(i)}
                className={`text-[10px] w-6 h-6 rounded-full border ${
                  i === currentPageIndex
                    ? 'bg-[#6a7257] text-black font-bold'
                    : 'bg-[#333] text-white'
                }`}
                title={p.title}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <WorkorderHeader
            currentPageIndex={currentPageIndex}
            pages={pages}
            onClose={onClose}
            metadata={metadata}
            woNumber={woNumber}
            hasAlerts={alerts.length > 0}
            onToggleAlerts={() => setShowAlerts((v) => !v)}
          />

          <section className="px-4 py-2 flex-grow overflow-auto">
            {currentPageIndex === 0 && (
              <WOInfoPage
                metadata={metadata}
                editModes={{}}
                toggleEdit={() => {}}
                handleChange={handleMetaChange}
                logoSrc={computedLogoSrc}
              />
            )}

            {currentPageIndex === 1 && (
              <BOMPage
                bomItems={bomItemsState}
                consumables={consumables}
                dfitBuildQtys={dfitBuildQtys}
                umaBuildQtys={umaBuildQtys}
              />
            )}

            {currentPageIndex === 2 && (
              <DFITPage
                metadata={dfitSelections[dfitActiveTab]}
                assets={assets}
                buildQtys={dfitBuildQtys}
                setBuildQtys={setDfitBuildQtys}
                activeTab={dfitActiveTab}
                setActiveTab={setDfitActiveTab}
                handleChange={handleDFITChange}
                baseColors={{
                  'Red Deer': 'text-white',
                  'Grand Prairie': 'text-white',
                  Nisku: 'text-white'
                }}
                addConsumable={(name, qty) =>
                  addConsumable(name, qty, 'DFIT', dfitActiveTab)
                }
                savedItems={dfitTabConsumables[dfitActiveTab]}
                setSavedItems={(items) => {
                  setDfitTabConsumables((prev) =>
                    prev.map((arr, i) => (i === dfitActiveTab ? items : arr))
                  );
                }}
              />
            )}

            {currentPageIndex === 3 && (
              <UpperMasterAssemblyPage
                metadata={metadata}
                assets={assets}
                tabs={umaTabs}
                selections={umaSelections}
                setSelections={setUmaSelections}
                buildQtys={umaBuildQtys}
                setBuildQtys={setUmaBuildQtys}
                activeTab={umaActiveTab}
                setActiveTab={setUmaActiveTab}
                handleChange={handleUMAChange}
                baseColors={{
                  'Red Deer': 'text-white',
                  'Grand Prairie': 'text-white',
                  Nisku: 'text-white'
                }}
                addConsumable={(name, qty) =>
                  addConsumable(name, qty, 'UMA', umaActiveTab)
                }
              />
            )}

            {currentPageIndex > 3 && (
              <NotesPage title={pages[currentPageIndex].title} />
            )}
          </section>

          <WorkorderFooter
            currentPageIndex={currentPageIndex}
            prevPageLabel={prevLabel}
            nextPageLabel={nextLabel}
            onPrev={handlePrev}
            onNext={handleNext}
            onGenerate={() => alert('Generate')}
            onSave={handleSave}
            canNext={canNext}
          />
        </div>
      </div>

      {showAlerts && <AlertsModal alerts={alerts} onClose={() => setShowAlerts(false)} />}
    </>
  );
}
