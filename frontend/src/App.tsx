import { useState } from "react";
import { useScrapeJob } from "./hooks/useScrapeJob";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ScrapeForm from "./components/ScrapeForm";
import ResultView from "./components/ResultView";
import Footer from "./components/Footer";

export type FormState = {
  urlsText: string;
  listingUrl: string;
  productQuery: string;
  maxPages: number;
  maxProducts: number | null;
  minDelay: number;
};

function App() {
  const { job, status, isBusy, error, startJob, clear } = useScrapeJob();

  const [form, setForm] = useState<FormState>({
    urlsText: "",
    listingUrl: "",
    productQuery: "",
    maxPages: 5,
    maxProducts: 10,
    minDelay: 1.0,
  });

  const updateField = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleLoadDemo = (urls: string[]) => {
    setForm((prev) => ({
      ...prev,
      urlsText: urls.join("\n"),
      listingUrl: "",
    }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onLoadDemo={handleLoadDemo} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl space-y-10 px-6 py-12">
            <ScrapeForm
              form={form}
              onChange={updateField}
              onStart={startJob}
              status={status}
              isBusy={isBusy}
              error={error}
              onClear={clear}
            />
            {job && (job.status === "done" || job.status === "failed") && (
              <ResultView job={job} onClear={clear} />
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
