type HeaderAccountLabelProps = {
  email?: string | null;
  fullName?: string | null;
};

export function HeaderAccountLabel({
  email,
  fullName
}: HeaderAccountLabelProps) {
  if (fullName?.trim()) {
    return fullName.trim();
  }

  if (!email) {
    return "Signed in";
  }

  return email.length > 28 ? `${email.slice(0, 25)}...` : email;
}
