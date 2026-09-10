"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, ExternalLink, QrCode } from "lucide-react";

interface QRCodeDisplayProps {
  roomCode: string;
}

export function QRCodeDisplay({ roomCode }: QRCodeDisplayProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const joinUrl = `${origin}/join/${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col items-center bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
      <div className="flex items-center gap-2 mb-3 text-academic-blue font-semibold text-sm">
        <QrCode className="w-4 h-4" />
        <span>Scan to Join Live Quiz</span>
      </div>

      {/* Real QR Code SVG */}
      <div className="p-3 bg-white rounded-xl shadow-inner border border-border/80">
        <QRCodeSVG
          value={joinUrl}
          size={180}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: "/icon.png",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      {/* 8-Digit Room Code Display */}
      <div className="mt-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">8-Digit Room Code</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="font-mono text-2xl font-extrabold tracking-widest text-foreground bg-muted px-4 py-1.5 rounded-lg border border-border">
            {roomCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Copy room code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 w-full">
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-academic-blue/10 text-academic-blue hover:bg-academic-blue/20 transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copiedLink ? "Link Copied!" : "Copy Join URL"}
        </button>
        <a
          href={joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Open join page in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
