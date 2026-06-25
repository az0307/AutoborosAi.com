import { useState, useEffect, useRef, useCallback } from "react";
import { Copy, FileText, Download, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function useCharacterReveal(text: string, isActive: boolean, speed = 15) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isActive || !text) {
      setDisplayed(text || "");
      setDone(true);
      return;
    }
    setDone(false);
    indexRef.current = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, isActive, speed]);

  return { displayed, done };
}

interface OutputStageProps {
  text: string;
  label?: string;
  toolType: string;
}

export default function OutputStage({
  text,
  label = "Result",
  toolType,
}: OutputStageProps) {
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const { displayed, done } = useCharacterReveal(text, !!text, 12);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [text]);

  const handleExportPDF = useCallback(async () => {
    if (!outputRef.current) return;
    const canvas = await html2canvas(outputRef.current, {
      backgroundColor: "#131316",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const pageHeight = 277;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`nexus-${toolType}-${Date.now()}.pdf`);
  }, [toolType]);

  const handleExportJSON = useCallback(() => {
    const data = {
      toolType,
      generatedAt: new Date().toISOString(),
      output: text,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-${toolType}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [text, toolType]);

  if (!text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium tracking-[0.04em] text-[var(--accent-blue)] uppercase">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors"
            style={{
              background: copied
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(59, 130, 246, 0.1)",
              color: copied ? "#10B981" : "var(--accent-blue)",
              border: `1px solid ${copied ? "rgba(16, 185, 129, 0.3)" : "rgba(59, 130, 246, 0.2)"}`,
            }}
          >
            {copied ? (
              <CheckCircle size={12} />
            ) : (
              <Copy size={12} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors hover:bg-[var(--bg-elevated)]"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <FileText size={12} />
            PDF
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors hover:bg-[var(--bg-elevated)]"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Download size={12} />
            JSON
          </button>
        </div>
      </div>
      <div
        ref={outputRef}
        className="relative overflow-hidden"
        style={{
          background: "var(--bg-base)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        {/* Top gradient border */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.4) 50%, transparent 100%)",
          }}
        />
        <pre
          className="text-[13px] leading-[1.7] whitespace-pre-wrap font-[Inter]"
          style={{ color: "var(--text-primary)", maxHeight: 480, overflowY: "auto" }}
        >
          {displayed}
          {!done && (
            <span className="inline-block w-[2px] h-[1em] bg-[var(--accent-blue)] ml-[1px] animate-pulse align-text-bottom" />
          )}
        </pre>
      </div>
    </motion.div>
  );
}
