import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../context/LanguageContext";

const BACK_TEXT_PREVIEW_LENGTH = 65;

function getCardIconSources(cardId) {
  const id = String(cardId ?? "").trim();
  if (!id) {
    return [];
  }

  const candidates = [`/icons/${id}.png`];
  const encoded = `/icons/${encodeURIComponent(id)}.png`;
  if (!candidates.includes(encoded)) {
    candidates.push(encoded);
  }

  if (id.endsWith(".")) {
    const withoutTrailingDot = `/icons/${id.slice(0, -1)}.png`;
    if (!candidates.includes(withoutTrailingDot)) {
      candidates.push(withoutTrailingDot);
    }
  }

  return candidates;
}

export default function HexCard({ card, position, onlyFront }) {
  const { t } = useLanguage();
  const [iconSourceIndex, setIconSourceIndex] = useState(0);
  const [isDefinitionModalOpen, setIsDefinitionModalOpen] = useState(false);

  const style = position
    ? { position: "absolute", left: position.x, top: position.y }
    : {};

  useEffect(() => {
    setIconSourceIndex(0);
  }, [card?.id]);

  useEffect(() => {
    if (!isDefinitionModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsDefinitionModalOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDefinitionModalOpen]);

  if (!card) return null;

  let extraClass = "";
  if (card.category === "recommandations-enseignant") {
    extraClass = "reco-enseignant";
  } else if (card.category === "recommandations-equipe") {
    extraClass = "reco-equipe";
  }

  const clipId = `hc-${card.id}`;
  const iconSources = getCardIconSources(card.id);
  const iconSource = iconSources[iconSourceIndex] || iconSources[0] || "";
  const iconCandidatesJson = JSON.stringify(iconSources);
  const fullDefinition = typeof card.definition === "string" ? card.definition.trim() : "";
  const isTruncatedDefinition =
    fullDefinition.length > BACK_TEXT_PREVIEW_LENGTH;
  const backTextPreview = isTruncatedDefinition
    ? `${fullDefinition.slice(0, BACK_TEXT_PREVIEW_LENGTH)}…`
    : fullDefinition;
  const definitionModal = isDefinitionModalOpen ? (
    <div
      className="hex-definition-modal-overlay"
      role="presentation"
      onClick={() => setIsDefinitionModalOpen(false)}
    >
      <div
        className="hex-definition-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t("common.viewFullText", { title: card.title })}
      >
        <button
          type="button"
          className="hex-definition-modal-close"
          aria-label={t("common.close")}
          onClick={() => setIsDefinitionModalOpen(false)}
        >
          ×
        </button>
        <div
          className={`hex-definition-modal-card ${card.category} ${extraClass}`}
          onClick={(event) => event.stopPropagation()}
        >
          <svg
            className="hex-definition-modal-outline"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" />
          </svg>
          <h3>{card.title}</h3>
          <p>{fullDefinition}</p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={`hex-card ${card.category}`} style={style}>
      <svg
        className={`hex ${extraClass}`}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <polygon points="0.5,0 0.93,0.25 0.93,0.75 0.5,1 0.07,0.75 0.07,0.25" />
          </clipPath>
        </defs>

        <polygon
          className="hex-shape"
          points="50,0 93,25 93,75 50,100 7,75 7,25"
        />

        <foreignObject
          x="0"
          y="0"
          width="100"
          height="100"
          clipPath={`url(#${clipId})`}
        >
          <div className="hex-inner">
            <div className="hex-front">
              <span>{card.id}</span>
              <h4>{card.title}</h4>
              <img
                src={iconSource}
                data-icon-candidates={iconCandidatesJson}
                alt={card.title}
                onError={() => {
                  setIconSourceIndex((current) => {
                    const next = current + 1;
                    return next < iconSources.length ? next : current;
                  });
                }}
              />
            </div>
            {!onlyFront && (
              <div className="hex-back">
                <div className="hex-back-content">
                  <div className="hex-back-preview">
                    <p>{backTextPreview}</p>
                  </div>
                  {isTruncatedDefinition && (
                    <button
                      type="button"
                      className={`hex-back-expand-btn ${extraClass ? `hex-back-expand-btn--${extraClass}` : ""}`.trim()}
                      title={t("common.viewFullText", { title: card.title })}
                      aria-label={t("common.viewFullText", { title: card.title })}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDefinitionModalOpen(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faExpand} />
                      <span>{t("common.seeMore")}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </foreignObject>
      </svg>
      {definitionModal && createPortal(definitionModal, document.body)}
    </div>
  );
}
