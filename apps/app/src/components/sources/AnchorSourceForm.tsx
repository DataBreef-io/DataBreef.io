"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Anchor, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EngineSelector } from "./EngineSelector";
import { LiveSecurityLog } from "./LiveSecurityLog";
import { DatabaseEngineType, IntrospectionLog } from "@/lib/introspection/types";
import { DatabaseTypeModal } from "./DatabaseTypeModal";
import { classifySourceAction } from "./classifyActions";
import { ClassificationResult } from "@/lib/dib/classifier";
import { anchorSourceAction } from "./actions";
import styles from "./AnchorSourceForm.module.css";

const anchorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  connectionString: z.string().url("Please provide a valid connection string URL."),
  dbType: z.enum(["postgres", "mysql", "mssql", "oracle", "snowflake"] as const),
});

type AnchorFormData = z.infer<typeof anchorSchema>;

export function AnchorSourceForm() {
  const [step, setStep] = useState(1);
  const [logs, setLogs] = useState<IntrospectionLog[]>([]);
  const [isIntrospecting, setIsIntrospecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Classification state
  const [anchoredSourceId, setAnchoredSourceId] = useState<string | null>(null);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [classifiedTableNames, setClassifiedTableNames] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<AnchorFormData>({
    resolver: zodResolver(anchorSchema),
    defaultValues: { dbType: "postgres" },
    mode: "onChange",
  });

  const selectedEngine = watch("dbType");

  const onSubmit = async (data: AnchorFormData) => {
    setIsIntrospecting(true);
    setLogs([]);
    setServerError(null);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("connectionString", data.connectionString);
    formData.append("dbType", data.dbType);

    try {
      const result = await anchorSourceAction(null, formData);
      setLogs(result.logs);

      if (result.success && result.sourceId) {
        setAnchoredSourceId(result.sourceId);
        // Run lightweight classification in the background
        try {
          const classResult = await classifySourceAction(result.sourceId);
          setClassification(classResult);
          setShowModal(true);
        } catch {
          // Classification failure is non-fatal; go straight to success
          setIsSuccess(true);
        }
      } else {
        setServerError(result.error || "Connection failed.");
      }
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred.");
    } finally {
      setIsIntrospecting(false);
    }
  };

  function handleModalDone() {
    setShowModal(false);
    setIsSuccess(true);
  }

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <>
      <div className={styles.container}>
        {/* Progress */}
        <div className={styles.progress}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>1. Selection</div>
          <div className={styles.line} />
          <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>2. Credentials</div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.formBody}>
          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.header}>
                <h2 className={styles.title}>Select your engine</h2>
                <p className={styles.subtitle}>Choose the type of database reef you&apos;re anchoring.</p>
              </div>
              <EngineSelector
                selected={selectedEngine}
                onSelect={(type) => setValue("dbType", type as DatabaseEngineType, { shouldValidate: true })}
              />
              <div className={styles.actions}>
                <Button type="button" onClick={nextStep} disabled={!selectedEngine}>
                  Next step
                  <ArrowRight size={14} className={styles.btnIcon} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.header}>
                <h2 className={styles.title}>Drop your anchor</h2>
                <p className={styles.subtitle}>Provide your connection string. We only require read-only access.</p>
              </div>

              <div className={styles.fields}>
                <Input
                  id="name"
                  label="Reef Name"
                  placeholder="e.g. Production Read Replica"
                  {...register("name")}
                  error={errors.name?.message}
                />
                <Input
                  id="connectionString"
                  label="Connection String"
                  placeholder="postgresql://user:pass@host:5432/db"
                  {...register("connectionString")}
                  error={errors.connectionString?.message}
                />
              </div>

              {serverError && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={16} />
                  <span>{serverError}</span>
                </div>
              )}

              {!isSuccess && (
                <div className={styles.actions}>
                  <Button type="button" variant="secondary" onClick={prevStep}>
                    <ArrowLeft size={14} className={styles.btnIconLeft} />
                    Back
                  </Button>
                  <Button type="submit" disabled={!isValid || isIntrospecting}>
                    {isIntrospecting ? (
                      <Loader2 size={14} className={styles.spin} />
                    ) : (
                      <Anchor size={14} className={styles.btnIcon} />
                    )}
                    Anchor Reef
                  </Button>
                </div>
              )}

              {(isIntrospecting || logs.length > 0) && (
                <div className={styles.auditSection}>
                  <LiveSecurityLog logs={logs} isComplete={isSuccess} />
                  {isSuccess && (
                    <div className={styles.successCta}>
                      <p>Reef successfully anchored. Time to surface some insights.</p>
                      <Button href="/sources" variant="primary">
                        View Reefs
                        <ArrowRight size={14} className={styles.btnIcon} />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {showModal && anchoredSourceId && classification && (
        <DatabaseTypeModal
          sourceId={anchoredSourceId}
          classification={classification}
          tableNames={classifiedTableNames}
          onDone={handleModalDone}
        />
      )}
    </>
  );
}
