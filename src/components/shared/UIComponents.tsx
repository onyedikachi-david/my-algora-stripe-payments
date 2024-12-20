import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Copy, Check, Loader2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 
        bg-gray-900 text-white text-xs rounded-lg py-2 px-3 absolute z-10 bottom-full left-1/2 -translate-x-1/2 
        mb-2 min-w-[12rem] shadow-lg">
        {content}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 
          border-x-8 border-x-transparent border-t-8 border-t-gray-900"></div>
      </div>
    </div>
  );
}

export function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      )}
      {children}
    </div>
  );
}

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContainer({ children, className = '' }: CardContainerProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  tooltip: string;
  icon: LucideIcon;
  colorClass: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  tooltip, 
  icon: Icon, 
  colorClass,
  trend,
  isLoading = false
}: MetricCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className={`rounded-xl p-6 ${colorClass}`}>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 transition-all duration-200 hover:shadow-md ${colorClass} group`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Icon className="h-5 w-5 text-gray-700 mr-2 group-hover:scale-110 transition-transform duration-200" />
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <Tooltip content={tooltip}>
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-gray-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Copy value"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
            {value}
          </p>
          {trend && (
            <span className={`ml-2 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
              {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

interface ExpandableSectionProps {
  title: string;
  tooltip: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function ExpandableSection({ 
  title, 
  tooltip, 
  children, 
  defaultExpanded = false 
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 
          transition-all duration-200 group"
      >
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
            {title}
          </h3>
          <Tooltip content={tooltip}>
            <HelpCircle className="h-4 w-4 text-gray-400 group-hover:text-indigo-400 transition-colors duration-200" />
          </Tooltip>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transition-all duration-200 transform group-hover:-translate-y-0.5" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transition-all duration-200 transform group-hover:translate-y-0.5" />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
} 