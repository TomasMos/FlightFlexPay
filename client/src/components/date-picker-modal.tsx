import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface DatePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripType: "return" | "one_way";
  selectedDates: DateRange | Date | undefined;
  onDateSelect: (dates: DateRange | Date | undefined) => void;
}

export function DatePickerModal({
  open,
  onOpenChange,
  tripType,
  selectedDates,
  onDateSelect,
}: DatePickerModalProps) {
  const [tempDates, setTempDates] = useState<DateRange | Date | undefined>(
    selectedDates
  );

  // Calculate start month (current month) and end month (18 months from now = 19 months total)
  const { startMonth, endMonth } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(1); // Start from first day of current month
    
    const end = new Date(today);
    end.setMonth(today.getMonth() + 18); // 18 months from current month (19 months total)
    
    return { startMonth: today, endMonth: end };
  }, []);

  // Reset temp dates when modal opens
  useEffect(() => {
    if (open) {
      setTempDates(selectedDates);
    }
  }, [open, selectedDates]);

  const handleDone = () => {
    onDateSelect(tempDates);
    onOpenChange(false);
  };

  const handleClose = () => {
    setTempDates(selectedDates); // Reset to original selection
    onOpenChange(false);
  };

  const formatDateRange = (range: DateRange | undefined): string => {
    if (!range?.from) return "";
    if (!range.to) {
      return formatSingleDate(range.from);
    }
    return `${formatSingleDate(range.from)} - ${formatSingleDate(range.to)}`;
  };

  const formatSingleDate = (date: Date): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const month = months[date.getMonth()];
    return `${day} ${dayNum} ${month}`;
  };

  const getHeaderText = (): string => {
    if (tripType === "return") {
      return "Depart → Return";
    } else {
      return "Depart";
    }
  };

  // Check if range is complete (both from and to dates selected)
  const isRangeComplete = useMemo(() => {
    if (tripType !== "return") return false;
    const range = tempDates as DateRange | undefined;
    return !!(range?.from && range?.to);
  }, [tempDates, tripType]);

  // Range mode classNames - conditionally apply rounded corners based on range completion
  const rangeClassNames = useMemo(() => ({
    months: "flex flex-col space-y-6",
    month: "space-y-4 md:space-y-6",
    caption: "flex justify-center pt-1 relative items-center mb-4 md:mb-6",
    caption_label: "text-sm md:text-base font-medium",
    nav: "space-x-1 flex items-center",
    nav_button: "hidden",
    nav_button_previous: "hidden",
    nav_button_next: "hidden",
    table: "w-full border-collapse space-y-1 mx-auto",
    head_row: "flex justify-center",
    head_cell:
      "text-muted-foreground rounded-md w-9 md:w-12 font-normal text-[0.8rem] md:text-sm",
    row: "flex w-full mt-2 justify-center",
    cell: "h-9 w-9 md:h-12 md:w-12 text-center text-sm md:text-base p-0 relative focus-within:relative focus-within:z-20",
    day: cn(
      "h-9 w-9 md:h-12 md:w-12 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
    ),
    day_range_start: isRangeComplete
      ? "rounded-l-md rounded-r-none"
      : "rounded-md",
    day_range_end: isRangeComplete
      ? "rounded-r-md rounded-l-none"
      : "rounded-md",
    day_selected:
      "bg-splickets-accent text-white hover:bg-splickets-accent hover:text-white focus:bg-splickets-accent focus:text-white",
    day_today: "",
    day_outside:
      "day-outside text-muted-foreground aria-selected:bg-splickets-accent/50 aria-selected:text-muted-foreground",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle:
      "aria-selected:bg-splickets-accent/20 aria-selected:text-white rounded-none",
    day_hidden: "invisible",
  }), [isRangeComplete]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 md:!left-[50%] md:!top-[50%] md:!translate-x-[-50%] md:!translate-y-[-50%] w-full h-full max-w-full max-h-full md:max-w-6xl md:h-[90vh] md:max-h-[90vh] flex flex-col p-0 gap-0 md:rounded-lg [&>button]:hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {getHeaderText()}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 rounded-full flex md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 rounded-full hidden md:flex"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 min-h-0">
          <div className="w-full max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto">
            {tripType === "return" ? (
              <Calendar
                mode="range"
                selected={tempDates as DateRange | undefined}
                onSelect={(dates) => {
                  setTempDates(dates);
                }}
                numberOfMonths={19}
                fromMonth={startMonth}
                toMonth={endMonth}
                showOutsideDays={false}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="w-full"
                classNames={rangeClassNames}
              />
            ) : (
              <Calendar
                mode="single"
                selected={tempDates as Date | undefined}
                onSelect={(date) => {
                  setTempDates(date);
                  if (date) {
                    setTimeout(() => {
                      onDateSelect(date);
                      onOpenChange(false);
                    }, 100);
                  }
                }}
                numberOfMonths={19}
                fromMonth={startMonth}
                toMonth={endMonth}
                showOutsideDays={false}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="w-full"
                classNames={{
                  months: "flex flex-col space-y-6",
                  month: "space-y-4 md:space-y-6",
                  caption: "flex justify-center pt-1 relative items-center mb-4 md:mb-6",
                  caption_label: "text-sm md:text-base font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "hidden",
                  nav_button_previous: "hidden",
                  nav_button_next: "hidden",
                  table: "w-full border-collapse space-y-1 mx-auto",
                  head_row: "flex justify-center",
                  head_cell:
                    "text-muted-foreground rounded-md w-9 md:w-12 font-normal text-[0.8rem] md:text-sm",
                  row: "flex w-full mt-2 justify-center",
                  cell: "h-9 w-9 md:h-12 md:w-12 text-center text-sm md:text-base p-0 relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:!rounded-md",
                  day: cn(
                    "h-9 w-9 md:h-12 md:w-12 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  ),
                  day_selected:
                    "bg-splickets-accent text-white hover:bg-splickets-accent hover:text-white focus:bg-splickets-accent focus:text-white !rounded-md",
                  day_today: "",
                  day_outside:
                    "day-outside text-muted-foreground aria-selected:bg-splickets-accent/50 aria-selected:text-muted-foreground",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_hidden: "invisible",
                }}
              />
            )}
          </div>
        </div>

        {tripType === "return" && (
          <div className="px-6 pb-6 pt-4 border-t flex-shrink-0 flex justify-center">
            <Button
              onClick={handleDone}
              className="w-full md:max-w-md bg-splickets-primary hover:bg-splickets-primary/90 text-white py-3"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

