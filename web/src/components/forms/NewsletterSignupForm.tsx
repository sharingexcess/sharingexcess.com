import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import {
  MAILCHIMP_NEWSLETTER_ACTION,
  MAILCHIMP_NEWSLETTER_HONEYPOT,
} from "@/lib/mailchimp";

export interface NewsletterSignupFormProps {
  inputTheme?: "onColor" | "onWhite";
  submitLabel?: string;
  buttonVariant?: "primary" | "secondary";
  buttonColorScheme?: "light" | "dark";
  /** Keep first and last name on one row at all breakpoints */
  inlineNameFields?: boolean;
  nameFieldsClassName?: string;
  className?: string;
}

export function NewsletterSignupForm({
  inputTheme = "onWhite",
  submitLabel = "Subscribe",
  buttonVariant = "primary",
  buttonColorScheme = "light",
  inlineNameFields = false,
  nameFieldsClassName,
  className,
}: NewsletterSignupFormProps) {
  return (
    <form
      action={MAILCHIMP_NEWSLETTER_ACTION}
      method="post"
      target="_blank"
      noValidate
      className={cn("flex w-full flex-col gap-4", className)}
    >
      <div
        className={cn(
          "grid gap-4",
          inlineNameFields ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
          nameFieldsClassName,
        )}
      >
        <TextInput theme={inputTheme} name="FNAME" placeholder="First Name" aria-label="First Name" />
        <TextInput theme={inputTheme} name="LNAME" placeholder="Last Name" aria-label="Last Name" />
      </div>
      <TextInput
        theme={inputTheme}
        name="EMAIL"
        type="email"
        placeholder="Email"
        aria-label="Email"
        required
      />
      <div aria-hidden className="absolute -left-[5000px]">
        <input type="text" name={MAILCHIMP_NEWSLETTER_HONEYPOT} tabIndex={-1} defaultValue="" />
      </div>
      <div>
        <Button
          type="submit"
          name="subscribe"
          variant={buttonVariant}
          colorScheme={buttonColorScheme}
          size="md"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default NewsletterSignupForm;
