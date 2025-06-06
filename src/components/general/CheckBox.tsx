import { useState } from "react";

interface CheckboxFilterProps {
    labels?: string[];
    options?: string[];
    onFilterChange: (selected: string[] | string) => void;
    extra?: string;
    uniqueSelection?: boolean;
}

const CheckboxFilter = ({
    labels = ["Boys","Girls","Both"],
    options = ["m", "f", "b"],
    onFilterChange,
    extra = "",
    uniqueSelection = false
}: CheckboxFilterProps) => {
    const [selected, setSelected] = useState<string | string[]>(uniqueSelection ? "" : []);

    interface HandleCheckboxChangeProps {
        (option: string): void;
    }

    const handleCheckboxChange: HandleCheckboxChangeProps = (option) => {
        let newSelected: string[] | string;
        if (uniqueSelection) {
            newSelected = selected === option ? "" : option; // Sélection unique
        } else {
            newSelected = (selected as string[]).includes(option)
                ? (selected as string[]).filter((item: string) => item !== option) // Désélection
                : [...(selected as string[]), option]; // Ajout
        }
        setSelected(newSelected);
        onFilterChange(newSelected); // Envoie les nouvelles valeurs au parent
    };

    return (
        <div className="flex flex-col gap-2">
            {options.map((option, i) => (
                <label key={options.length-i} className={`flex items-center gap-2 cursor-pointer capitalize dark:text-gray-400`} >
                    <input
                        type="checkbox"
                        checked={uniqueSelection ? selected === option : selected.includes(option)}
                        onChange={() => handleCheckboxChange(option)}
                        className="w-5 h-5 accent-primary"
                    />
                     {extra && <span className="text-base">{extra}</span>}{labels[i]} 
                </label>
            ))}
        </div>
    );
};

export default CheckboxFilter;
