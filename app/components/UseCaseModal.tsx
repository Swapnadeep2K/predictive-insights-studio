"use client";

import { Button } from "@react-spectrum/button";
import { DialogContainer, Dialog } from "@react-spectrum/dialog";
import { Heading, Header, Divider, Content, ButtonGroup, Footer } from "@adobe/react-spectrum";
import RoiModule from "./RoiModule";
import type { UseCase } from "../types";

type UseCaseModalProps = {
  modalUseCase: UseCase | null;
  setModalUseCase: (uc: UseCase | null) => void;
  isHypExpanded: boolean;
  setIsHypExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isCriteriaExpanded: boolean;
  setIsCriteriaExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  toastTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  setToastMessage: (msg: string | null) => void;
  formatDisplayValue: (value?: string) => string;
};

export default function UseCaseModal({
  modalUseCase,
  setModalUseCase,
  isHypExpanded,
  setIsHypExpanded,
  isCriteriaExpanded,
  setIsCriteriaExpanded,
  toastTimerRef,
  setToastMessage,
  formatDisplayValue,
}: UseCaseModalProps) {
  return (
    <DialogContainer onDismiss={() => setModalUseCase(null)}>
      {modalUseCase && (
        <Dialog size="L">
          <Heading>{formatDisplayValue(modalUseCase.use_case_title ?? "Use case")}</Heading>
          <Header>Use Case Details</Header>
          <Divider />
          <Content>
            {!modalUseCase.roi_result ? (
              <div className="text-sm text-slate-600">No ROI result available for this use case.</div>
            ) : (
              <>
                <RoiModule roi={modalUseCase.roi_result} />

                <div className="mt-7 border-t border-slate-200 pt-6">
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="rounded-md border border-slate-200 p-4">
                      <div className="text-sm font-semibold text-slate-900">What</div>
                      {modalUseCase.what_to_show?.message ? (
                        <div className="mt-2 text-sm text-slate-600" title={modalUseCase.what_to_show.message}>
                          <div className="line-clamp-3">{modalUseCase.what_to_show.message}</div>
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-slate-600">—</div>
                      )}
                      {modalUseCase.what_to_show?.explanation && (
                        <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500" title={modalUseCase.what_to_show.explanation}>
                          <div className="line-clamp-3">{modalUseCase.what_to_show.explanation}</div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-md border border-slate-200 p-4">
                      <div className="text-sm font-semibold text-slate-900">Where / When</div>
                      <div className="mt-2 space-y-1.5 text-sm text-slate-700">
                        <div>
                          <span className="text-slate-500">Channel:</span>{" "}
                          <span title={formatDisplayValue(modalUseCase.where_to_show?.channel)}>
                            {formatDisplayValue(modalUseCase.where_to_show?.channel)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Surface:</span>{" "}
                          <span title={formatDisplayValue(modalUseCase.where_to_show?.surface)}>
                            {formatDisplayValue(modalUseCase.where_to_show?.surface)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-slate-500">Trigger:</span>{" "}
                          <span title={formatDisplayValue(modalUseCase.when_to_show?.trigger)}>
                            {formatDisplayValue(modalUseCase.when_to_show?.trigger)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Frequency:</span>{" "}
                          <span title={formatDisplayValue(modalUseCase.when_to_show?.frequency)}>
                            {formatDisplayValue(modalUseCase.when_to_show?.frequency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-slate-200 p-4 lg:col-span-2">
                      <div className="text-sm font-semibold text-slate-900">Hypothesis / Targeting</div>
                      <div className="mt-2 text-sm text-slate-600" title={modalUseCase.hypothesis ?? "—"}>
                        <div className={isHypExpanded ? "" : "line-clamp-2"}>{modalUseCase.hypothesis ?? "—"}</div>
                      </div>
                      {(modalUseCase.hypothesis?.length ?? 0) > 180 && (
                        <button
                          type="button"
                          className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                          onClick={() => setIsHypExpanded((prev) => !prev)}
                        >
                          {isHypExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                      {modalUseCase.target_criteria && (
                        <div
                          className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700"
                          title={modalUseCase.target_criteria}
                        >
                          <div className={`whitespace-pre-wrap break-words ${isCriteriaExpanded ? "" : "line-clamp-2"}`}>
                            {modalUseCase.target_criteria}
                          </div>
                          {modalUseCase.target_criteria.length > 180 && (
                            <button
                              type="button"
                              className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                              onClick={() => setIsCriteriaExpanded((prev) => !prev)}
                            >
                              {isCriteriaExpanded ? "Show less" : "Read more"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </Content>
          <Footer>
            <Button variant="secondary" onPress={() => setModalUseCase(null)}>Cancel</Button>
          </Footer>
          <ButtonGroup>
            <Button variant="secondary" onPress={() => {}}>View Full Details</Button>
            <Button variant="accent" onPress={() => {
              setToastMessage(`"${formatDisplayValue(modalUseCase.use_case_title)}" activated.`);
              toastTimerRef.current = setTimeout(() => setToastMessage(null), 4000);
              setModalUseCase(null);
            }}>Activate</Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogContainer>
  );
}
