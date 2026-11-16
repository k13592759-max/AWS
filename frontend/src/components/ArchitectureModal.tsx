import React, { useState } from 'react';
import {
  X,
  Server,
  Database,
  Cloud,
  Cpu,
  Layers,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { SystemStatus } from '../types/ticket';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: SystemStatus | null;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
  systemStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'workflow' | 'asl' | 'sam'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200/80 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                AWS Serverless Architecture
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                  ap-south-1 (Mumbai)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                End-to-end serverless infrastructure for CampusFix AI issue escalation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-6 bg-white text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Architecture Overview
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'workflow'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Step Functions Workflow
          </button>
          <button
            onClick={() => setActiveTab('asl')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'asl'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            ASL Definition
          </button>
          <button
            onClick={() => setActiveTab('sam')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'sam'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            SAM Template
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stack Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2.5 text-blue-600 font-bold text-sm mb-2">
                    <Cloud className="w-4 h-4" />
                    API Gateway HTTP API
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Low-latency HTTP API v2 handling REST endpoints with CORS policies and direct integration to Lambda.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2.5 text-indigo-600 font-bold text-sm mb-2">
                    <Cpu className="w-4 h-4" />
                    Python 3.12 Lambdas
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Event-driven micro-functions executing CRUD operations, S3 presigned URL generation, and status validation.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2.5 text-amber-600 font-bold text-sm mb-2">
                    <Database className="w-4 h-4" />
                    Amazon DynamoDB
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Single-table architecture (<code>CampusFixTickets</code>) with GSIs for high-speed indexing by status and building.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2.5 text-violet-600 font-bold text-sm mb-2">
                    <GitBranch className="w-4 h-4" />
                    AWS Step Functions
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automated SLA escalation state machine. Waits 60s demo SLA, checks resolution, and auto-escalates if unresolved.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-sm mb-2">
                    <Server className="w-4 h-4" />
                    Amazon S3 Storage
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Secure photographic evidence uploads using time-limited presigned PUT URLs with MIME and size constraints.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2.5 text-rose-600 font-bold text-sm mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    Least-Privilege Security
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Zero hardcoded credentials. Scoped IAM policies: DynamoDBCrudPolicy, S3CrudPolicy, StepFunctionsExecutionPolicy.
                  </p>
                </div>
              </div>

              {/* Status Box */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-900 tracking-wide uppercase">
                    Current Deployment Environment
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-700">
                    <span>Region: <strong>{systemStatus?.awsRegion || 'ap-south-1'}</strong></span>
                    <span>•</span>
                    <span>DynamoDB: <strong>{systemStatus?.dynamoDbTable || 'CampusFixTickets'}</strong></span>
                    <span>•</span>
                    <span>Execution: <strong>{systemStatus?.mode || 'Local & AWS SAM Ready'}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-emerald-700 border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  SLA Escalation Engine Ready
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-sm text-slate-900 mb-2">Automatic Escalation Lifecycle</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every issue submitted to CampusFix AI initiates a dedicated AWS Step Functions state machine execution.
                  If campus facility administrators fail to resolve or acknowledge the ticket within the configurable SLA
                  (default 60 seconds for live demo), the ticket is automatically escalated to executive leadership.
                </p>
              </div>

              {/* Interactive Visual Workflow */}
              <div className="flex flex-col md:flex-row items-stretch gap-3 text-xs">
                <div className="flex-1 p-4 rounded-xl border border-blue-200 bg-blue-50/60 flex flex-col">
                  <span className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    Issue Created
                  </span>
                  <p className="text-slate-600 mt-1">Ticket stored in DynamoDB. Step Functions execution starts with SLA parameter.</p>
                </div>

                <div className="flex items-center justify-center text-slate-400">
                  <ArrowRight className="w-4 h-4 hidden md:block" />
                </div>

                <div className="flex-1 p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col">
                  <span className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
                    WaitForSLA
                  </span>
                  <p className="text-slate-600 mt-1">Wait state pauses for 60 seconds (configurable per priority).</p>
                </div>

                <div className="flex items-center justify-center text-slate-400">
                  <ArrowRight className="w-4 h-4 hidden md:block" />
                </div>

                <div className="flex-1 p-4 rounded-xl border border-violet-200 bg-violet-50/60 flex flex-col">
                  <span className="font-bold text-violet-900 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px]">3</span>
                    CheckStatus Lambda
                  </span>
                  <p className="text-slate-600 mt-1">Reads DynamoDB. If RESOLVED, workflow cleanly stops.</p>
                </div>

                <div className="flex items-center justify-center text-slate-400">
                  <ArrowRight className="w-4 h-4 hidden md:block" />
                </div>

                <div className="flex-1 p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex flex-col">
                  <span className="font-bold text-rose-900 mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">4</span>
                    Auto-Escalate
                  </span>
                  <p className="text-slate-600 mt-1">Updates status to ESCALATED, timestamps breach, updates admin dashboard.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'asl' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">infrastructure/state-machine.asl.json</span>
                <span className="text-xs text-indigo-600 font-medium">Amazon States Language (ASL)</span>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs overflow-x-auto font-mono max-h-96">
{`{
  "Comment": "CampusFix AI SLA Escalation Workflow",
  "StartAt": "WaitForSLA",
  "States": {
    "WaitForSLA": {
      "Type": "Wait",
      "SecondsPath": "$.slaSeconds",
      "Next": "CheckTicketStatus"
    },
    "CheckTicketStatus": {
      "Type": "Task",
      "Resource": "\${CheckStatusFunctionArn}",
      "ResultPath": "$.checkResult",
      "Next": "EvaluateTicketStatus"
    },
    "EvaluateTicketStatus": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.checkResult.status",
          "StringEquals": "RESOLVED",
          "Next": "TicketAlreadyResolved"
        }
      ],
      "Default": "TriggerEscalation"
    },
    "TriggerEscalation": {
      "Type": "Task",
      "Resource": "\${EscalateFunctionArn}",
      "Next": "EscalationCompleted"
    },
    "TicketAlreadyResolved": {
      "Type": "Succeed"
    },
    "EscalationCompleted": {
      "Type": "Succeed"
    }
  }
}`}
              </pre>
            </div>
          )}

          {activeTab === 'sam' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">infrastructure/template.yaml</span>
                <span className="text-xs text-indigo-600 font-medium">AWS Serverless Application Model (SAM)</span>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs overflow-x-auto font-mono max-h-96">
{`AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: CampusFix AI - ap-south-1 Mumbai Serverless Architecture

Resources:
  CampusFixHttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      Name: CampusFixApi
      CorsConfiguration:
        AllowOrigins: ['*']
        AllowMethods: [GET, POST, PATCH, OPTIONS]

  TicketsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: CampusFixTickets
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: ticketId
          AttributeType: S
      KeySchema:
        - AttributeName: ticketId
          KeyType: HASH

  EscalationStateMachine:
    Type: AWS::Serverless::StateMachine
    Properties:
      DefinitionUri: state-machine.asl.json`}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Configurable 60s Demo SLA | Production 2h-24h
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
