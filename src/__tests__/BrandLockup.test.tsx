import React from "react";
import { render, screen } from "@testing-library/react";
import { BrandLockup } from "@/components/BrandLockup";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    alt,
    src,
    // Strip Next.js-specific props that are not valid HTML img attributes
    priority: _priority,
    ...props
  }: {
    alt: string;
    src: string;
    priority?: boolean;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src as string} {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}));

describe("BrandLockup", () => {
  describe("default (no certId)", () => {
    it("renders the site name", () => {
      render(<BrandLockup />);
      expect(screen.getByText("Cert Practice")).toBeInTheDocument();
    });

    it("renders the Datadog logo", () => {
      render(<BrandLockup />);
      expect(screen.getByAltText("Datadog")).toBeInTheDocument();
    });

    it("does not render the ServiceNow text", () => {
      render(<BrandLockup />);
      expect(screen.queryByText("ServiceNow")).not.toBeInTheDocument();
    });
  });

  describe('certId="datadog-fundamentals"', () => {
    it("renders the site name", () => {
      render(<BrandLockup certId="datadog-fundamentals" />);
      expect(screen.getByText("Cert Practice")).toBeInTheDocument();
    });

    it("renders the Datadog logo", () => {
      render(<BrandLockup certId="datadog-fundamentals" />);
      expect(screen.getByAltText("Datadog")).toBeInTheDocument();
    });

    it("does not render the ServiceNow text", () => {
      render(<BrandLockup certId="datadog-fundamentals" />);
      expect(screen.queryByText("ServiceNow")).not.toBeInTheDocument();
    });
  });

  describe('certId="servicenow-csa"', () => {
    it("renders the ServiceNow text", () => {
      render(<BrandLockup certId="servicenow-csa" />);
      expect(screen.getByText("ServiceNow")).toBeInTheDocument();
    });

    it("renders the site name", () => {
      render(<BrandLockup certId="servicenow-csa" />);
      expect(screen.getByText("Cert Practice")).toBeInTheDocument();
    });

    it("does not render the Datadog logo", () => {
      render(<BrandLockup certId="servicenow-csa" />);
      expect(screen.queryByAltText("Datadog")).not.toBeInTheDocument();
    });
  });

  describe('certId="servicenow-cis-itsm"', () => {
    it("renders the ServiceNow text", () => {
      render(<BrandLockup certId="servicenow-cis-itsm" />);
      expect(screen.getByText("ServiceNow")).toBeInTheDocument();
    });

    it("does not render the Datadog logo", () => {
      render(<BrandLockup certId="servicenow-cis-itsm" />);
      expect(screen.queryByAltText("Datadog")).not.toBeInTheDocument();
    });
  });

  describe('certId="servicenow-cad"', () => {
    it("renders the ServiceNow text", () => {
      render(<BrandLockup certId="servicenow-cad" />);
      expect(screen.getByText("ServiceNow")).toBeInTheDocument();
    });

    it("does not render the Datadog logo", () => {
      render(<BrandLockup certId="servicenow-cad" />);
      expect(screen.queryByAltText("Datadog")).not.toBeInTheDocument();
    });
  });

  describe('size="hero" with a ServiceNow cert', () => {
    it("renders with larger text class (text-2xl)", () => {
      const { container } = render(<BrandLockup certId="servicenow-csa" size="hero" />);
      const spans = container.querySelectorAll("span");
      const hasHeroClass = Array.from(spans).some((el) =>
        el.classList.contains("text-2xl")
      );
      expect(hasHeroClass).toBe(true);
    });
  });

  describe('size="hero" with Datadog (default)', () => {
    it("renders the Datadog logo at hero dimensions", () => {
      const { container } = render(<BrandLockup size="hero" />);
      const imgs = container.querySelectorAll("img");
      expect(imgs.length).toBeGreaterThanOrEqual(1);
      // hero logoHeight = 48
      expect(imgs[0].getAttribute("height")).toBe("48");
    });
  });
});
