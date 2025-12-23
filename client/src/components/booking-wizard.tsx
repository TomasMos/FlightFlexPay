import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingWizardProps {
  currentStep: "passenger" | "extras" | "payment";
}

const steps = [
  { id: "passenger", label: "Passenger Details" },
  { id: "extras", label: "Extras" },
  { id: "payment", label: "Payment" },
] as const;

export function BookingWizard({ currentStep }: BookingWizardProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="w-full px-4 py-6 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-3 relative">
          {/* Background connector line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-splickets-slate-200" />
          
          {/* Completed connector line - spans from right edge of first circle to left edge of current circle */}
          {currentStepIndex > 0 && (
            <div
              className="absolute top-5 h-0.5 bg-primary"
              style={{
                left: "calc(16.666% + 20px)",
                width: `calc(${currentStepIndex * 33.333}% - 40px)`,
              }}
            />
          )}

          {/* Steps */}
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10"
              >
                {/* Step Circle - fixed size, no layout shift */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors shrink-0",
                    isCompleted && "bg-primary text-white",
                    isCurrent && "bg-primary text-white",
                    isUpcoming && "bg-splickets-slate-200 text-splickets-slate-500"
                  )}
                  style={
                    isCurrent
                      ? {
                          boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.2)",
                        }
                      : {}
                  }
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {/* Step Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center px-1",
                    isCurrent || isCompleted
                      ? "text-splickets-slate-900"
                      : "text-splickets-slate-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
