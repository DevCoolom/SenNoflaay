import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider } from '../lib/LanguageContext';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import Members from '../components/Members';
import Finance from '../components/Finance';
import Events from '../components/Events';
import Bills from '../components/Bills';
import Fundraising from '../components/Fundraising';
import Reports from '../components/Reports';
import Tasks from '../components/Tasks';
import {
  DEMO_USER, DEMO_MEMBERS, DEMO_OBJECTIVES, DEMO_EXPENSES,
  DEMO_EVENTS, DEMO_BILLS, DEMO_TASKS, DEMO_CAMPAIGNS, DEMO_DONATIONS,
  DEMO_MEMBERSHIP_FEE_CONFIG, DEMO_CORRECTIONS, DEMO_AUDIT_LOGS,
} from './demoData';

const noop = () => {};
const noopAsync = async () => {};

function DemoContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <>
      {/* Demo banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white flex items-center justify-center gap-4 py-2 text-xs font-bold uppercase tracking-widest">
        <span>Demo Mode — Read Only</span>
        <span className="opacity-40">·</span>
        <button onClick={() => navigate('/')} className="underline underline-offset-2 hover:opacity-80 transition-opacity">
          Back to Home
        </button>
      </div>

      <div style={{ paddingTop: '2.5rem' }}>
        <Layout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={DEMO_USER}
          onLogout={() => navigate('/')}
          settings={{ app_name: 'FC Bern' }}
          notifications={[]}
          onMarkNotificationRead={noop}
        >
          {activeTab === 'dashboard' && (
            <Dashboard
              members={DEMO_MEMBERS}
              objectives={DEMO_OBJECTIVES}
              expenses={DEMO_EXPENSES}
              events={DEMO_EVENTS}
              bills={DEMO_BILLS}
              tasks={DEMO_TASKS}
              auditLogs={DEMO_AUDIT_LOGS}
              associationId="demo"
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'members' && (
            <Members
              members={DEMO_MEMBERS}
              membershipFeeConfig={DEMO_MEMBERSHIP_FEE_CONFIG}
              settings={{ app_name: 'FC Bern' }}
              objectives={DEMO_OBJECTIVES}
              canAdd={false}
              canEdit={false}
              canDelete={false}
              onAddMember={noop}
              onImportMember={noop}
              onEditMember={noop}
              onViewDetails={noop}
              onAddPayment={noop}
              onDeleteMember={noop}
            />
          )}

          {activeTab === 'finance' && (
            <Finance
              objectives={DEMO_OBJECTIVES}
              expenses={DEMO_EXPENSES}
              members={DEMO_MEMBERS}
              bills={DEMO_BILLS}
              membershipFeeConfig={DEMO_MEMBERSHIP_FEE_CONFIG}
              canAdd={false}
              canEdit={false}
              canDelete={false}
              onAddObjective={noop}
              onDeleteObjective={noop}
              onViewObjective={noop}
              onAddExpense={noop}
              onImportExpense={noop}
            />
          )}

          {activeTab === 'events' && (
            <Events
              events={DEMO_EVENTS}
              canAdd={false}
              canEdit={false}
              canDelete={false}
              onAddEvent={noop}
              onImportEvent={noop}
              onEditEvent={noop}
              onViewEvent={noop}
              onDeleteEvent={noop}
            />
          )}

          {activeTab === 'bills' && (
            <Bills
              bills={DEMO_BILLS}
              canAdd={false}
              canEdit={false}
              canDelete={false}
              onAddBill={noopAsync}
              onImportBill={noop}
              onDeleteBill={noop}
            />
          )}

          {activeTab === 'fundraising' && (
            <Fundraising
              campaigns={DEMO_CAMPAIGNS}
              donations={DEMO_DONATIONS}
              associationId="demo"
              settings={{ app_name: 'FC Bern' }}
              onAddCampaign={noop}
              onEditCampaign={noop}
              onDeleteCampaign={noop}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              members={DEMO_MEMBERS}
              expenses={DEMO_EXPENSES}
              bills={DEMO_BILLS}
              corrections={DEMO_CORRECTIONS}
              objectives={DEMO_OBJECTIVES}
              events={DEMO_EVENTS}
              canAdd={false}
              canEdit={false}
              canDelete={false}
              onEditYear={noop}
            />
          )}

          {activeTab === 'tasks' && (
            <Tasks
              tasks={DEMO_TASKS}
              canAdd={false}
              canEdit={false}
              canDelete={false}
              onAddTask={noop}
              onImportTask={noop}
              onUpdateTask={noop}
              onDeleteTask={noop}
              onReorderTasks={noop}
            />
          )}
        </Layout>
      </div>
    </>
  );
}

export default function DemoApp() {
  return (
    <LanguageProvider>
      <DemoContent />
    </LanguageProvider>
  );
}
