"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createUser, getRoles, getSession, logout, type Role, type Session } from "../../../lib/api";
import { WorkspaceShell } from "../../../components/workspace-shell";

export default function NewUserPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getSession().then((currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      return getRoles(1, 100).then((response) => { if (isMounted) setRoles(response.data.filter((role) => role.status === "ACTIVE" && !role.isSystem)); });
    }).catch((requestError) => {
      if (!isMounted) return;
      if (getStatus(requestError) === 401) router.replace("/");
      else setError(requestError instanceof Error ? requestError.message : "Unable to load roles.");
    }).finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password || !roleId) { setError("Name, email, password, and role are required."); return; }
    if (password.length < 6) { setError("Password must contain at least 6 characters."); return; }
    setError("");
    setIsSaving(true);
    try {
      await createUser({ name: name.trim(), email: email.trim(), password, roleId: Number(roleId), ...(phone.trim() ? { phone: phone.trim() } : {}), ...(gender ? { gender } : {}) });
      router.push("/user");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create user.");
    } finally { setIsSaving(false); }
  }

  async function handleLogout() { try { await logout(); } finally { router.replace("/"); } }
  if (isLoading || !session) return <main className="session-loading"><span className="brand-mark">G</span><p>Loading user form...</p></main>;

  return <WorkspaceShell activeItem="User" breadcrumb="User / New" user={session.user} onLogout={handleLogout}><div className="page-intro permission-intro"><div><p className="eyebrow">ACCESS CONTROL</p><h1>New user</h1><p className="intro-copy">Create an account and assign an active role.</p></div></div><form className="permission-form user-form" onSubmit={handleSubmit}><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">ACCOUNT DETAILS</p><h2>Identity</h2></div><span className="required-note">* Required</span></div><label htmlFor="user-name">Name</label><input id="user-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Alex Morgan" maxLength={100} /><label htmlFor="user-email">Email</label><input id="user-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@company.com" /><label htmlFor="user-password">Password</label><input id="user-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} /></section><section className="panel form-section"><div className="form-section-heading"><div><p className="eyebrow">PROFILE</p><h2>Contact and role</h2></div></div><label htmlFor="user-phone">Phone</label><input id="user-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Optional" maxLength={30} /><label htmlFor="user-gender">Gender</label><select id="user-gender" value={gender} onChange={(event) => setGender(event.target.value as "MALE" | "FEMALE" | "")}><option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option></select><label htmlFor="user-role">Role</label><select id="user-role" value={roleId} onChange={(event) => setRoleId(event.target.value)} required><option value="">Select an active role</option>{roles.map((role) => <option value={role.id} key={role.id}>{role.name}</option>)}</select>{roles.length === 0 && <p className="field-hint">No active custom roles are available. Create a role first.</p>}</section>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => router.push("/user")}>Cancel</button><button type="submit" className="primary-button compact-button" disabled={isSaving || roles.length === 0}>{isSaving ? "Creating..." : "Create user"}<span aria-hidden="true">-&gt;</span></button></div></form></WorkspaceShell>;
}

function getStatus(error: unknown) { return error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined; }