import React, { forwardRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value: string | number;
  onValueChange: (value: string) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      if (value !== undefined && value !== null && value !== "") {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          const formatted = new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(numValue);
          setDisplayValue(formatted);
        } else {
          setDisplayValue("");
        }
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      const numericValue = inputValue.replace(/\D/g, "");

      if (numericValue.length === 0) {
        setDisplayValue("");
        onValueChange("");
        return;
      }

      const floatValue = parseInt(numericValue, 10) / 100;

      const formattedValue = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(floatValue);

      setDisplayValue(formattedValue);

      onValueChange(floatValue.toFixed(2));
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";
