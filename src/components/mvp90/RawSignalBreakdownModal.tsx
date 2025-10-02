"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RawSignalBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: number;
  entityName: string;
}

interface SourceMetadata {
  source_name: string;
  source_id: string;
  raw_snippet: string;
  crawl_ts: string;
  confidence?: number;
}

interface SignalChainItem {
  status: string;
  timestamp: string;
  processor: string;
}

interface MLClassification {
  category: string;
  value: string;
  confidence: number;
}

interface SignalMetaData {
  id: number;
  entity_name: string;
  source_metadata: SourceMetadata[];
  ingestion_timestamp: string;
  signal_chain: SignalChainItem[];
  tags: string[];
  ml_classifications: MLClassification[];
  associated_links: string[];
  quality_score: number;
  processing_notes: string;
}

const RawSignalBreakdownModal: React.FC<RawSignalBreakdownModalProps> = ({
  isOpen,
  onClose,
  entityId,
  entityName
}) => {
  const [signalData, setSignalData] = useState<SignalMetaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && entityId) {
      loadSignalData();
    }
  }, [isOpen, entityId]);

  const loadSignalData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/signal_meta/${entityId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load signal data: ${response.status}`);
      }
      
      const data = await response.json();
      setSignalData(data);
    } catch (err) {
      console.error('Error loading signal data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load signal data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scraped': return 'text-blue-400';
      case 'enriched': return 'text-yellow-400';
      case 'scored': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-mono">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Raw Signal Breakdown - {entityName}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading signal data...</div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4">
            <div className="font-medium mb-1">Error Loading Signal Data</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {signalData && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="border border-border p-3">
              <h3 className="text-sm font-semibold mb-2">Signal Overview</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Entity ID:</span>
                  <span className="ml-2 font-medium">{signalData.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Quality Score:</span>
                  <span className={`ml-2 font-medium ${getConfidenceColor(signalData.quality_score)}`}>
                    {(signalData.quality_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Ingestion:</span>
                  <span className="ml-2 font-medium">{formatTimestamp(signalData.ingestion_timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Source Metadata */}
            <div className="border border-border p-3">
              <h3 className="text-sm font-semibold mb-3">Source Metadata ({signalData.source_metadata.length} sources)</h3>
              <div className="space-y-3">
                {signalData.source_metadata.map((source, index) => (
                  <div key={index} className="border border-border/50 p-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-primary">{source.source_name}</span>
                        <span className="text-xs text-muted-foreground">#{source.source_id}</span>
                        {source.confidence && (
                          <span className={`text-xs ${getConfidenceColor(source.confidence)}`}>
                            {(source.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(source.raw_snippet)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                        title="Copy snippet"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Crawled: {formatTimestamp(source.crawl_ts)}
                    </div>
                    <div className="text-xs bg-muted/30 p-2 border-l-2 border-primary/30">
                      "{source.raw_snippet}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signal Chain */}
            <div className="border border-border p-3">
              <h3 className="text-sm font-semibold mb-3">Signal Processing Chain</h3>
              <div className="space-y-2">
                {signalData.signal_chain.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-semibold ${getStatusColor(step.status)}`}>
                          {step.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">by {step.processor}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(step.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags and Classifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Tags */}
              <div className="border border-border p-3">
                <h3 className="text-sm font-semibold mb-3">Tags ({signalData.tags.length})</h3>
                <div className="flex flex-wrap gap-1">
                  {signalData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/20 text-primary text-xs border border-primary/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* ML Classifications */}
              <div className="border border-border p-3">
                <h3 className="text-sm font-semibold mb-3">ML Classifications</h3>
                <div className="space-y-2">
                  {signalData.ml_classifications.map((classification, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{classification.category}:</span>
                        <span className="text-xs font-medium">{classification.value}</span>
                      </div>
                      <span className={`text-xs ${getConfidenceColor(classification.confidence)}`}>
                        {(classification.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Associated Links */}
            <div className="border border-border p-3">
              <h3 className="text-sm font-semibold mb-3">Associated Links ({signalData.associated_links.length})</h3>
              <div className="space-y-1">
                {signalData.associated_links.map((link, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 truncate flex-1"
                    >
                      {link}
                    </a>
                    <button
                      onClick={() => copyToClipboard(link)}
                      className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                      title="Copy link"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Notes */}
            {signalData.processing_notes && (
              <div className="border border-border p-3">
                <h3 className="text-sm font-semibold mb-2">Processing Notes</h3>
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 border-l-2 border-yellow-400/30">
                  {signalData.processing_notes}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Last updated: {formatTimestamp(signalData.ingestion_timestamp)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(signalData, null, 2))}
                  className="px-3 py-1 bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors"
                >
                  Copy JSON
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1 bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RawSignalBreakdownModal;
