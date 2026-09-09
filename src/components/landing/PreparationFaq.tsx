import { Link } from "react-router-dom";

export default function PreparationFaq() {
  return (
    <section id="preparation-faq" className="app-shell scroll-mt-28 py-12 sm:py-16" aria-labelledby="preparation-faq-title">
      <div className="panel p-6 sm:p-10">
        <h2 id="preparation-faq-title" className="font-heading text-2xl font-semibold sm:text-3xl">RCMP practice tests: preparation questions</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-heading text-lg font-semibold">What does the RCMP Online Entrance Assessment cover?</h3>
            <p className="mt-3 leading-7 text-muted-foreground">The RCMP lists six sections: workstyle preference, language comprehension, numerical skills, spatial skills, memory, and business reasoning. Review the <a className="underline underline-offset-4" href="https://www.rcmp.ca/en/careers-rcmp/police-officer-careers/application-process/rcmp-online-assessment-preparatory-guide">official RCMP preparation guide</a> for assessment instructions and sample material.</p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold">How can I practise for the RCMP assessment?</h3>
            <p className="mt-3 leading-7 text-muted-foreground">Start with a skill area you want to improve, work through its lessons, and review your answers. Use timed practice tests to practise pacing. AptitudeForge combines <a className="underline underline-offset-4" href="#modules">preparation modules</a> with quizzes and saved progress so you can return to your study plan.</p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold">Can I try RCMP practice questions for free?</h3>
            <p className="mt-3 leading-7 text-muted-foreground">Yes. <Link className="underline underline-offset-4" to="/signup?mode=signup">Create a free account</Link> to try limited lessons and practice questions. The free preview has access limits; <a className="underline underline-offset-4" href="#pricing">compare the free and premium plans</a> before choosing your access.</p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold">Are these official RCMP exam questions?</h3>
            <p className="mt-3 leading-7 text-muted-foreground">No. AptitudeForge is an independent preparation platform, not an RCMP service. Its practice material is for skill development and is not the official assessment. Follow the instructions you receive from the RCMP for your application.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
