import { FieldErrors, UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
  label: string;
  type: string;
  register: UseFormRegisterReturn;
  errors: FieldErrors;
	errorKey?: string;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({label, type, register, errors, errorKey, error}) => {
	const field = errorKey || label;
	return (
		<>
			<div className={`group relative border-b w-80 mt-4 px-3 pb-1.5 pt-2.5 ${(errors[field] || error) ? "border-red-600" : "border-violet-900"}`}>
				<div className="flex justify-between">
					<label className="text-xs font-medium text-muted-foreground capitalize">{label}</label>
				</div>
				<input type={type} autoComplete="off" {...register}
					className={`block w-full border-0 bg-transparent p-0 text-sm file:my-1 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-medium placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 text-foreground ${type === 'text' ? 'h-[30px]' : ''}`} />
			</div>
			{errors[field] ? <p className="px-3 pt-2 text-xs text-red-600 self-start">{`${errors[field].message}`}</p>
			: error && <p className="px-3 pt-2 text-xs text-red-600 self-start">{error}</p>}
		</>
	)
}

export default FormInput;