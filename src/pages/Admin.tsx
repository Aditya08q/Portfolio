import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, storage, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import PixelButton from "@/components/PixelButton";
import { toast } from "sonner";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    getDoc(doc(db, "site", "resume")).then((snap) => {
      if (snap.exists()) setCurrentUrl(snap.data().url);
    }).catch(() => {});
  }, [isAdmin]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed in");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const upload = async () => {
    if (!file) return toast.error("Pick a PDF first");
    setUploading(true);
    try {
      const r = ref(storage, `resume/resume.pdf`);
      await uploadBytes(r, file, { contentType: "application/pdf" });
      const url = await getDownloadURL(r);
      await setDoc(doc(db, "site", "resume"), { url, updatedAt: Date.now() });
      setCurrentUrl(url);
      toast.success("Resume updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6">
        <form onSubmit={login} className="pixel-card p-6 w-full max-w-sm space-y-4 bg-surface/80">
          <h1 className="font-pixel text-sm text-foreground">Admin Login</h1>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded font-mono text-sm text-foreground"
            required
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded font-mono text-sm text-foreground"
            required
          />
          <PixelButton type="submit" variant="primary" className="w-full">Sign In</PixelButton>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6 text-center">
        <div className="space-y-4">
          <p className="font-mono text-sm text-destructive">Not an admin account.</p>
          <p className="font-mono text-xs text-muted-foreground">Your UID: {user.uid}</p>
          <p className="font-mono text-xs text-muted-foreground">
            Add a doc at <code>admins/{user.uid}</code> in Firestore to grant access.
          </p>
          <PixelButton variant="secondary" onClick={() => signOut(auth)}>Sign out</PixelButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-pixel text-sm text-foreground">Resume Admin</h1>
          <PixelButton variant="secondary" size="sm" onClick={() => signOut(auth)}>Sign out</PixelButton>
        </div>

        <div className="pixel-card p-6 bg-surface/80 space-y-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-foreground font-mono"
          />
          <PixelButton variant="primary" onClick={upload} disabled={uploading || !file}>
            {uploading ? "Uploading…" : "Upload / Replace Resume"}
          </PixelButton>

          {currentUrl && (
            <p className="text-xs font-mono text-muted-foreground break-all">
              Current: <a href={currentUrl} target="_blank" rel="noreferrer" className="text-primary underline">open</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
