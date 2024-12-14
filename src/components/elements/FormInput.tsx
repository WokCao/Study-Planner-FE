import { FieldErrors, UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
	label: string;
	type: string;
	register: UseFormRegisterReturn[];
	errors: FieldErrors;
	errorKey?: string;
	error?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, type, register, errors, errorKey, error }) => {
	let field = errorKey || label;
	const priorityLevel = ['High', 'Medium', 'Low'];
	const estimatedTimeUnit = ['second(s)', 'minute(s)', 'hour(s)', 'day(s)', 'week(s)', 'month(s)', 'year(s)'];
	const status = ['Todo', 'In Progress', 'Completed', 'Expired'];
	const additionalRegister = register.length === 2 ? register[1] : register[0];

	const valuesToUse =
		label === 'priority level'
			? priorityLevel
			: label === 'estimated time'
				? estimatedTimeUnit
				: label === 'status'
					? status
					: null;
	field = field === 'estimated time' ? 'estimatedTime' : field;

	return (
		<>
			<div className={`group relative border-b w-80 mt-4 px-3 pb-1.5 pt-2.5 ${(errors[field] || error) ? "border-red-600" : "border-violet-900"}`}>
				<div className="flex justify-between">
					<label className="text-xs font-medium text-muted-foreground capitalize">{label}</label>
				</div>
				<div className="flex items-center">
					<input type={type} autoComplete="off" {...register[0]} // This will overlap the ...register[0] at select tag below
						className={`${label.startsWith('priority') || label.startsWith('status') ? 'w-0' : 'w-full'} border-0 bg-transparent p-0 text-sm file:my-1 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-medium placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 text-foreground ${type === 'text' || 'date' ? 'h-[30px]' : ''}`} />

					{/* Case with specific values */}
					{valuesToUse && <span className={`${label.startsWith('estimated') ? 'ms-auto' : 'w-full'}`}>
						<select className={`text-sm focus:outline-none focus:border-none hover:cursor-pointer ${label.startsWith('estimated') ? '' : 'w-full'}`} {...additionalRegister} >
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