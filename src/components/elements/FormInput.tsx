import { useState } from "react";
import { FieldErrors, UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
	label: string;
	type: string;
	register: UseFormRegisterReturn[];
	errors: FieldErrors;
	errorKey?: string;
	error?: string;
	values?: any[] | undefined; // Property holds values for UPDATE case
}

const FormInput: React.FC<FormInputProps> = ({ label, type, register, errors, errorKey, error, values }) => {
	let field = errorKey || label;
	const priorityLevel = ['High', 'Medium', 'Low'];
	const estimatedTimeUnit = ['second(s)', 'minute(s)', 'hour(s)', 'day(s)', 'week(s)', 'month(s)', 'year(s)'];
	const status = ['Todo', 'In Progress', 'Completed'];
	const additionalRegister = register.length === 2 ? register[1] : register[0];

	// Create a state to hover the values
	const [valuesState, setValuesState] = useState<any[] | undefined>(values);

	const valuesToUse =
		label === 'priority level'
			? priorityLevel
			: label === 'estimated time'
				? estimatedTimeUnit
				: label === 'status'
					? status
					: null;
	field = field === 'estimated time' ? 'estimatedTime' : field;

	// Set new values to fields when user enters
	const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
		setValuesState([event.target.value, valuesState?.[1]]);
	}

	const handleChangeSelect = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
		setValuesState([valuesState?.[0], event.target.value]);
	}

	return (
		<>
			<div className={`group relative border-b mobile:w-full tablet:w-80 mt-4 px-3 pb-1.5 pt-2.5 ${(errors[field] || error) ? "border-red-600" : "border-violet-900"}`}>
				<div className="flex justify-between">
					<label className="text-xs font-medium text-muted-foreground capitalize">{label}</label>
				</div>
				<div className="flex items-center">
					<input
						type={type}
						autoComplete="off"
						{...(label.startsWith('priority') || label.startsWith('status') ? {} : register[0])}
						className={`${label.startsWith('priority') || label.startsWith('status') ? 'w-0' : 'w-full'
							} border-0 bg-transparent p-0 text-sm file:my-1 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-medium placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 text-foreground ${type === 'text' || type === 'datetime-local' || type === 'number' ? 'h-[30px]' : ''
							}`}
						value={label.startsWith('name') || label.startsWith('description') || label.startsWith('estimated') || label.startsWith('deadline') ? valuesState?.[0] : undefined} // This is for text | number | datetime-local
						onChange={handleChange}
					/>

					{/* Case with specific values */}
					{valuesToUse && <span className={`${label.startsWith('estimated') ? 'ms-auto' : 'w-full'}`}>
						<select className={`text-sm focus:outline-none focus:border-none bg-transparent hover:cursor-pointer 
							${label.startsWith('estimated') ? '' : 'w-full'}`}
							{...additionalRegister}
							value={label.startsWith('estimated') ? valuesState?.[1] : valuesState?.[0]} // This is for select tag
							onChange={label.startsWith('estimated') ? handleChangeSelect : handleChange}
						>
							{valuesToUse.map((value: string) => (
								<option key={value} value={value} className="text-sm py-1">{value}</option>
							))}
						</select>
					</span>}
				</div>
			</div>
			{errors[field] ? <p className="px-3 pt-2 text-xs text-red-600 self-center">{`${errors[field]?.message}`}</p>
				: error && <p className="px-3 pt-2 text-xs text-red-600 self-center">{error}</p>}
		</>
	)
}

export default FormInput;