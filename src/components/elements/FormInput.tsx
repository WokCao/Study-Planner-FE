import { FieldErrors, UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
  label: string;
  type: string;
  register: UseFormRegisterReturn;
  errors: FieldErrors;
  error: string;
}

const FormInput: React.FC<FormInputProps> = ({label, type, register, errors, error}) => {
	return (
		<>
			<div className="group relative border-b border-violet-900 w-80 mt-4 px-3 pb-1.5 pt-2.5">
				<div className="flex justify-between">
					<label className="text-xs font-medium text-muted-foreground capitalize">{label}</label>
				</div>
				<input type={type} autoComplete="off" {...register}
					className="block w-full border-0 bg-transparent p-0 text-sm file:my-1 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-medium placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 text-foreground" />
			</div>
			{errors[label] ? <p className="pt-2 text-sm text-red-600">{`${errors[label].message}`}</p>
			: error && <p className="pt-2 text-sm text-red-600">{error}</p>}
		</>
	)
}

export default FormInput;