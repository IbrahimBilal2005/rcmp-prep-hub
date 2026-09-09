import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { useUrlState } from "./useUrlState";

afterEach(cleanup);
const Screen = () => {
  const [tab, setTab] = useUrlState("tab", "modules", ["modules", "tests"]);
  const navigate = useNavigate();
  return <><p>{tab}</p><button onClick={() => setTab("tests")}>Tests</button><button onClick={() => navigate(-1)}>Back</button><button onClick={() => navigate(1)}>Forward</button></>;
};
it("restores a dashboard tab from its URL", () => {
  render(<MemoryRouter initialEntries={["/dashboard?tab=tests"]}><Screen /></MemoryRouter>);
  expect(screen.getByText("tests")).toBeInTheDocument();
});
it("supports back and forward between tabs", () => {
  render(<MemoryRouter initialEntries={["/dashboard"]}><Screen /></MemoryRouter>);
  fireEvent.click(screen.getByText("Tests"));
  expect(screen.getByText("tests")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Back"));
  expect(screen.getByText("modules")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Forward"));
  expect(screen.getByText("tests")).toBeInTheDocument();
});
