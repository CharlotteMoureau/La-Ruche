import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDownload,
    faFlaskVial,
    faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import RucheWorkspace from "../components/RucheWorkspace";
import { useLanguage } from "../context/LanguageContext";
import { HIVE_KINDS } from "../lib/hives";
import { captureBoardFrontAndBackZip, triggerDownload } from "../lib/snapshot";

export default function DemoHivePage() {
    const { t } = useLanguage();
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState("");

    const handleExport = useCallback(async () => {
        if (isExporting) return;

        const board = document.querySelector(".hive-board");
        if (!board) return;

        try {
            setIsExporting(true);
            setExportError("");

            const { blob, fileName } = await captureBoardFrontAndBackZip(board, {
                title: t("toolbar.exportTitle"),
                frontBoardFileName: t("toolbar.frontBoardExportName"),
                backBoardFileName: t("toolbar.backBoardExportName"),
            });
            triggerDownload(blob, fileName);
        } catch (err) {
            setExportError(
                t("toolbar.exportFailed", {
                    message: err?.message || "unknown",
                }),
            );
        } finally {
            setIsExporting(false);
        }
    }, [isExporting, t]);

    useEffect(() => {
        document.body.classList.add("editor-route");
        return () => {
            document.body.classList.remove("editor-route");
        };
    }, []);

    return (
        <section className="editor-page">
            <div className="editor-topbar demo-topbar">
                <div className="editor-topbar-main">
                    <span className="demo-badge">
                        <FontAwesomeIcon icon={faFlaskVial} />
                        {t("demo.badge")}
                    </span>
                    <p className="demo-topbar-info">{t("demo.info")}</p>
                </div>
                <div className="editor-topbar-actions">
                    <div className="inline-actions">
                        <button
                            type="button"
                            className="button-link-download"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            <FontAwesomeIcon icon={faDownload} />
                            {isExporting ? t("toolbar.exporting") : t("toolbar.export")}
                        </button>
                        <Link to="/register" className="button-primary demo-cta-button">
                            <FontAwesomeIcon icon={faUserPlus} />
                            {t("demo.cta")}
                        </Link>
                    </div>
                </div>
            </div>
            {exportError ? <p className="form-error">{exportError}</p> : null}

            <RucheWorkspace
                initialBoardData={null}
                hiveKind={HIVE_KINDS.STANDARD}
                canEdit={true}
                canNote={false}
                showCardNotes={false}
            />
        </section>
    );
}
