"use client";
import { FormInputProps, FormBlockProps } from "@/app/lib/types";
import "./formBlock.css";
import "./button.css";
import Link from "next/link";
import { FormEvent, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";


function FormRow({ row }: { row: FormInputProps[] }) {
  return row.map((row, index: number) => {
    return <FormItem field={row} key={index} />;
  });
}

function FormItem({ field }: { field: FormInputProps }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const evaluateInputRange = (ref: HTMLInputElement) => {
    if (field.minMax && parseFloat(ref.value) > field.minMax[1]) {
      ref.value = field.minMax[1].toString();
    } else if (field.minMax && parseFloat(ref.value) < field.minMax[0]) {
      ref.value = field.minMax[0].toString();
    }
  };

  if (inputRef.current && field.minMax) {
    inputRef.current.addEventListener("change", () => {
      evaluateInputRange(inputRef.current as HTMLInputElement);
    });
  }

  switch (field.type) {
    case "textarea":
      return (
        <label key={field.label}>
          <div>{field.label}</div>
          <textarea
            placeholder={field.placeholder}
            name={field.name ? field.name : ""}
            defaultValue={field.defaultValue}
            style={{ height: field.height }}
          />
        </label>
      );
    case "chips":
      return (
        <label key={field.label}>
          <div>{field.label}</div>
          <input placeholder={field.placeholder} />
        </label>
      );
    case "cancel":
      return (
        <Link
          href={field.href ? field.href : "/"}
          key={field.label}
          className="button secondary"
          onClick={() => {router.back()}} // Redirige a la página anterior
        >
          {field.value}
        </Link>
      );
    case "submit":
      return (
        <input
          key={field.label}
          className="button primary"
          type="submit"
          value={field.value}
        />
      );
    case "select":
      return (
        <label>
          <div>{field.label}</div>
          <select 
            name={field.name} 
            defaultValue={field.defaultValue || ""}
            onChange={field.onChange} // Aseguramos que el onChange se pase correctamente
            disabled={field.disabled}
          >
            {field.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      );
    default:
      return (
        <label key={field.label}>
          <div>{field.label}</div>
          <input
            ref={inputRef}
            name={field.name ? field.name : ""}
            type={field.type}
            key={field.label}
            placeholder={field.placeholder}
            value={field.value}
            defaultValue={field.defaultValue}
            min={field.minMax ? field.minMax[0] : 0}
            max={field.minMax ? field.minMax[1] : 999999999999}
          />
        </label>
      );
  }
}

function FormBlock({ rows, onSubmit, validationSchema }: FormBlockProps) {
  const router = useRouter();
  const actualRoute = usePathname();

  //funcion para mostrar la notificación
  const showToast = (response: {
    message: string;
    statusCode: number;
    route: string;
  }) => {
    if (response.statusCode == 200) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <form
      encType="multipart/form-data"
      className="form-block"
      onSubmit={async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        let response: { message: string; statusCode: number; route: string } = {
          message: "",
          statusCode: 0,
          route: "",
        };

        if (validationSchema) {
          const formObj = Object.fromEntries(formData.entries());

          // Zod necesita un objeto donde los valores sean "File" para validar el archivo
          const parsedData = validationSchema.safeParse({
            ...formObj,
            cv: formData.get("cv"), // Inyecta el archivo para validación
          });

          const validationErrors: string[] = [];
          if (!parsedData.success) {
            parsedData.error.errors.forEach((error) => {
              validationErrors.push(error.message);
              console.log(error);
            });

            validationErrors.forEach((e) => {
              toast.error(e);
            });
          }

          if (validationErrors.length === 0) {
            response = await onSubmit(formData, actualRoute);
            showToast(response);
          }
          
        } else {
          response = await onSubmit(formData, actualRoute);
          showToast(response);
        }

        router.push(response.route);
      }}
    >
      {rows.map((row, index: number) => {
        return (
          <div className="form-row" key={index}>
            {Array.isArray(row) ? (
              <FormRow row={row} />
            ) : (
              <FormItem field={row} />
            )}
          </div>
        );
      })}
    </form>
  );
}

export default FormBlock;
