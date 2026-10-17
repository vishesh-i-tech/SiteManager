import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, ToolRecord, MaterialRecord, ExpenseDue } from '../../types';
import { exportSiteReportPdf } from '../../utils/reportExporter';
import { db } from '../../core/db/database';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Building,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface ReportsExporterProps {
  sites: Site[];
  tools: ToolRecord[];
  materials: MaterialRecord[];
  dues: ExpenseDue[];
}

export const ReportsExporter: React.FC<ReportsExporterProps> = ({
  sites,
  tools,
  materials,
  dues,
}) => {
  const { t, language, tradeConfig } = useTheme();
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportSitePdf = async (site: Site) => {
    setIsExporting(true);
    try {
      const finance = await db.getSiteFinanceSummary(site.id);
      const sTools = tools.filter((t) => t.siteId === site.id);
      const sMaterials = materials.filter((m) => m.siteId === site.id);
      const sDues = dues.filter((d) => d.siteId === site.id);
      const sClientPayments = await db.clientPayments.where('siteId').equals(site.id).toArray();

      exportSiteReportPdf(site, finance, sTools, sMaterials, sDues, sClientPayments, 'SiteSaathi Contractor Statement');
    } catch (err) {
      console.error('Export PDF error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
          {t('navReports')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {language === 'hi' ? 'सीए, मुनीम या क्लाइंट के लिए पेशेवर पीडीएफ व एक्सेल स्टेटमेंट बनाएं' : 'Generate professional PDF bills, expense statements and audit reports for clients'}
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sites.map((site) => {
          const sMaterials = materials.filter((m) => m.siteId === site.id);
          const sTools = tools.filter((t) => t.siteId === site.id);
          const sDues = dues.filter((d) => d.siteId === site.id);

          return (
            <div
              key={site.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {site.siteType}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Budget: ₹{(site.estimatedBudget || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                  {site.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">{site.location}</p>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-2">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-center">
                    <span className="text-slate-400 block">Materials</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sMaterials.length} entries</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-center">
                    <span className="text-slate-400 block">Tools</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sTools.length} tools</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-center">
                    <span className="text-slate-400 block">Dues</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sDues.length} bills</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Status: <strong className="capitalize text-slate-700 dark:text-slate-300">{site.workStatus}</strong>
                </span>

                <button
                  onClick={() => handleExportSitePdf(site)}
                  disabled={isExporting}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-1.5 btn-tactile glow-theme"
                  style={{ backgroundColor: tradeConfig.primaryColor }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'PDF डाउनलोड करें' : 'Download PDF'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
