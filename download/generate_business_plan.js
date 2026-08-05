const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, TabStopType, TabStopPosition, ExternalHyperlink,
  InternalHyperlink, Bookmark, LevelFormat, TableOfContents,
  TableLayoutType
} = require("docx");
const fs = require("fs");

// Utility function - must be defined first
function stripHash(hex) { return hex.replace("#", ""); }

// ── Palette: GO-1 Graphite Orange (for proposals/plans) ──
var P = {
  bg: "1A2330", primary: "FFFFFF", accent: "D4875A",
  cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
  table: { headerBg: "D4875A", headerText: "FFFFFF", accentLine: "D4875A", innerLine: "DDD0C8", surface: "F8F0EB" }
};
var bodyPalette = { primary: "1A2330", body: "2C3E50", secondary: "607080", accent: "D4875A", surface: "FDF8F3" };

var allNoBorders = {
  top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }
};
var noBorders = { 
  top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, 
  left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } 
};

function emptyPara() { return new Paragraph({ children: [] }); }

// ── Title Layout Functions ──
function estimateTextWidth(text, pt) {
  var width = 0;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    var code = ch.codePointAt(0);
    var isCJK = (code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF) ||
      (code >= 0x3000 && code <= 0x303F) || (code >= 0xFF00 && code <= 0xFFEF);
    if (isCJK) {
      width += pt * 20;
    } else {
      width += pt * 11;
    }
  }
  return width;
}

function calcTitleLayout(title, availableWidth, maxPt, minPt) {
  maxPt = maxPt || 40;
  minPt = minPt || 24;
  for (var pt = maxPt; pt >= minPt; pt -= 2) {
    if (estimateTextWidth(title, pt) <= availableWidth) {
      return { titlePt: pt, titleLines: [title] };
    }
  }
  var words = title.split(/\s+/);
  var mid = Math.ceil(words.length / 2);
  return { 
    titlePt: minPt, 
    titleLines: [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] 
  };
}

// ── Cover Recipe R4: Top Color Block ──
function buildCoverR4(config) {
  var palette = config.palette;
  var padL = 1200;
  var padR = 800;
  var availableWidth = 11906 - padL - padR;
  
  var layoutResult = calcTitleLayout(config.title, availableWidth, 36, 26);
  var titlePt = layoutResult.titlePt;
  var titleLines = layoutResult.titleLines;
  var titleSize = titlePt * 2;

  var UPPER_MIN = 7500;
  var DIVIDER_H = 60;
  var upperContentH = 0;
  
  if (config.englishLabel) {
    upperContentH += (9 * 23 + 500);
  }
  upperContentH += titleLines.length * (titlePt * 23 + 200);
  if (config.subtitle) {
    upperContentH += (12 * 23 + 200);
  }
  
  var UPPER_H = Math.max(UPPER_MIN, upperContentH + 1500 + 800);

  var contentEstimate = 0;
  if (config.englishLabel) {
    contentEstimate += (9 * 23 + 500);
  }
  contentEstimate += titleLines.length * (titlePt * 23 + 200);
  if (config.subtitle) {
    contentEstimate += (12 * 23 + 200);
  }
  
  var spacerIntrinsic = 280;
  var topSpacing = Math.max(UPPER_H - contentEstimate - spacerIntrinsic - 800, 400);

  // Build upper block children array
  var upperChildren = [];
  upperChildren.push(new Paragraph({ spacing: { before: topSpacing } }));
  
  if (config.englishLabel) {
    upperChildren.push(new Paragraph({
      spacing: { after: 500 },
      children: [new TextRun({ 
        text: config.englishLabel.split("").join(" "), 
        size: 18, 
        color: palette.accent, 
        font: { ascii: "Calibri" }, 
        characterSpacing: 60 
      })]
    }));
  }
  
  for (var i = 0; i < titleLines.length; i++) {
    var line = titleLines[i];
    var afterSpacing = (i < titleLines.length - 1) ? 100 : 200;
    upperChildren.push(new Paragraph({
      spacing: { after: afterSpacing },
      children: [new TextRun({ 
        text: line, 
        size: titleSize, 
        bold: true, 
        color: palette.cover.titleColor, 
        font: { eastAsia: "SimHei", ascii: "Arial" } 
      })]
    }));
  }
  
  if (config.subtitle) {
    upperChildren.push(new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ 
        text: config.subtitle, 
        size: 24, 
        color: palette.cover.subtitleColor, 
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } 
      })]
    }));
  }

  var upperBlock = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: UPPER_H, rule: "exact" },
      children: [new TableCell({
        shading: { fill: palette.bg }, 
        borders: noBorders,
        verticalAlign: "top",
        margins: { left: padL, right: padR },
        children: upperChildren
      })]
    })]
  });

  var divider = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: DIVIDER_H, rule: "exact" },
      children: [new TableCell({ 
        borders: noBorders, 
        shading: { fill: palette.accent }, 
        children: [emptyPara()] 
      })]
    })]
  });

  // Build lower content
  var lowerChildren = [];
  lowerChildren.push(new Paragraph({ spacing: { before: 800 } }));
  
  if (config.metaLines) {
    for (var j = 0; j < config.metaLines.length; j++) {
      var metaLine = config.metaLines[j];
      lowerChildren.push(new Paragraph({
        indent: { left: padL }, 
        spacing: { after: 100 },
        children: [new TextRun({ 
          text: metaLine, 
          size: 28, 
          color: palette.cover.metaColor, 
          font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } 
        })]
      }));
    }
  }
  
  lowerChildren.push(new Paragraph({ spacing: { before: 2000 } }));
  lowerChildren.push(new Paragraph({
    indent: { left: padL },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 22, color: "909090" }),
      new TextRun({ text: "          " }),
      new TextRun({ text: config.footerRight || "", size: 22, color: "909090" })
    ]
  }));

  // Combine all children
  var allCoverChildren = [];
  allCoverChildren.push(upperBlock);
  allCoverChildren.push(divider);
  for (var k = 0; k < lowerChildren.length; k++) {
    allCoverChildren.push(lowerChildren[k]);
  }

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { fill: "FFFFFF" }, 
        borders: noBorders,
        verticalAlign: "top",
        children: allCoverChildren
      })]
    })]
  })];
}

// ── Component Builders ──
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200, line: 312 },
    children: [new TextRun({ 
      text: text, 
      bold: true, 
      size: 32, 
      color: stripHash(bodyPalette.primary), 
      font: { ascii: "Calibri", eastAsia: "SimHei" } 
    })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 160, line: 312 },
    children: [new TextRun({ 
      text: text, 
      bold: true, 
      size: 28, 
      color: stripHash(bodyPalette.primary), 
      font: { ascii: "Calibri", eastAsia: "SimHei" } 
    })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({ 
      text: text, 
      bold: true, 
      size: 24, 
      color: stripHash(bodyPalette.primary), 
      font: { ascii: "Calibri", eastAsia: "SimHei" } 
    })]
  });
}

function bodyPara(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ 
      text: text, 
      size: 24, 
      color: stripHash(bodyPalette.body), 
      font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } 
    })]
  });
}

function bodyParaNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ 
      text: text, 
      size: 24, 
      color: stripHash(bodyPalette.body), 
      font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } 
    })]
  });
}

function bulletItem(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ 
      text: text, 
      size: 24, 
      color: stripHash(bodyPalette.body), 
      font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } 
    })]
  });
}

function createTable(headers, data, colWidths) {
  var headerCells = [];
  for (var h = 0; h < headers.length; h++) {
    headerCells.push(new TableCell({
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      shading: { type: ShadingType.CLEAR, fill: P.table.headerBg },
      width: { size: colWidths[h], type: WidthType.PERCENTAGE },
      children: [new Paragraph({ 
        children: [new TextRun({ 
          text: headers[h], 
          bold: true, 
          size: 21, 
          color: P.table.headerText 
        })] 
      })]
    }));
  }

  var headerRow = new TableRow({
    tableHeader: true, 
    cantSplit: true,
    children: headerCells
  });

  var dataRows = [];
  for (var r = 0; r < data.length; r++) {
    var row = data[r];
    var cells = [];
    for (var cellIdx = 0; cellIdx < row.length; cellIdx++) {
      var fillColor = (r % 2 === 0) ? P.table.surface : "FFFFFF";
      cells.push(new TableCell({
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        shading: { type: ShadingType.CLEAR, fill: fillColor },
        width: { size: colWidths[cellIdx], type: WidthType.PERCENTAGE },
        children: [new Paragraph({ 
          children: [new TextRun({ 
            text: row[cellIdx], 
            size: 21 
          })] 
        })]
      }));
    }
    dataRows.push(new TableRow({
      cantSplit: true,
      children: cells
    }));
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: stripHash(P.table.accentLine) },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: stripHash(P.table.accentLine) },
      left: { style: BorderStyle.NONE }, 
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.table.innerLine },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [headerRow].concat(dataRows)
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT CONTENT SECTIONS
// ══════════════════════════════════════════════════════════════════════════════

function buildExecutiveSummary() {
  var content = [];
  
  content.push(heading1("1. Executive Summary"));
  
  content.push(heading2("1.1 Vision Statement"));
  content.push(bodyPara("Endeavor Science is building AETH-1, the world's first truly accessible scientific computing platform designed to democratize discovery. Our vision is a future where every researcher, from graduate students to pharmaceutical scientists, has access to enterprise-grade computational tools without the traditional barriers of cost, complexity, and infrastructure requirements."));
  content.push(bodyPara("We believe that scientific breakthroughs should not be limited by computational resources or software accessibility. AETH-1 represents a paradigm shift in how the global research community approaches data analysis, simulation, and collaborative discovery."));
  
  content.push(heading2("1.2 Problem Overview"));
  content.push(bodyPara("The current scientific software landscape is fragmented, expensive, and inaccessible to the majority of researchers worldwide. Key pain points include: prohibitively expensive licensing costs that exclude smaller institutions and developing nations; steep learning curves requiring specialized training; siloed tools that don't integrate well with each other; massive infrastructure requirements that individual labs cannot afford; and collaboration barriers that slow down the pace of scientific progress."));
  content.push(bodyPara("Our market research indicates that over 70% of academic researchers and 45% of industry R&D teams report being unable to fully pursue promising research directions due to software and computational limitations. This represents not just a market opportunity, but a fundamental inefficiency in the global scientific enterprise."));
  
  content.push(heading2("1.3 Solution Summary"));
  content.push(bodyPara("AETH-1 is a cloud-native scientific computing platform that combines intuitive user interfaces with powerful backend computation. Our platform offers: a unified workspace for multiple scientific disciplines including molecular modeling, bioinformatics, materials science, and data analysis; seamless integration with existing workflows through APIs and plugins; collaborative features enabling real-time teamwork across institutions; transparent pay-as-you-go pricing that scales from individual researchers to large enterprises; and built-in reproducibility and compliance features essential for modern research."));
  
  content.push(heading2("1.4 Market Opportunity Highlights"));
  content.push(bodyPara("The global scientific software market exceeds $45 billion annually, with projected growth of 12% CAGR through 2030. Our addressable market spans four primary segments: Academic Research ($15B), Biotech/Pharma R&D ($18B), Industrial R&D ($8B), and Government/Defense ($4B). The total addressable market (TAM) for our platform approach is $45B, with a serviceable addressable market (SAM) of $18B in our initial target segments, and an achievable serviceable obtainable market (SOM) of $900M by Year 5."));
  
  content.push(heading2("1.5 Business Model Snapshot"));
  content.push(bodyPara("Endeavor Science operates on a multi-tier SaaS model with five revenue streams: subscription tiers (Free/Pro/Team/Enterprise), compute credits for heavy workloads, marketplace commissions on third-party tools and datasets, training and certification programs, and professional services for custom implementations. This diversified approach ensures stable recurring revenue while capturing high-value enterprise opportunities."));
  
  content.push(heading2("1.6 Financial Highlights"));
  content.push(createTable(
    ["Metric", "Year 1", "Year 3", "Year 5"],
    [
      ["Annual Revenue", "$1.2M", "$18M", "$85M"],
      ["ARR Growth", "-", "285%", "156%"],
      ["Gross Margin", "72%", "78%", "82%"],
      ["Customers", "450", "4,200", "18,500"],
      ["Enterprise Clients", "12", "145", "680"]
    ],
    [35, 16, 22, 27]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("1.7 Funding Requirements"));
  content.push(bodyPara("We are seeking $5M in seed funding to complete platform development, establish initial market presence, and achieve product-market fit. Subsequent rounds include Series A ($15-25M at 18-24 months) for scaling operations and geographic expansion, and Series B ($50-80M at Year 4) for international growth and potential strategic acquisitions."));
  
  content.push(heading2("1.8 The Team Advantage"));
  content.push(bodyPara("Our founding team possesses a rare combination of deep scientific expertise and full-stack engineering capabilities. With postgraduate-level credentials spanning Molecular Biology, Bioinformatics, Chemistry, Computational Physics, and Data Science, combined with technical proficiency across Assembly, C, Fortran, JVM internals, Functional Programming, Big Data technologies, Modern Web frameworks, and Cloud infrastructure, we are uniquely positioned to bridge the gap between scientific needs and technological solutions."));
  
  return content;
}

function buildCompanyOverview() {
  var content = [];
  
  content.push(heading1("2. Company Overview"));
  
  content.push(heading2("2.1 Mission Statement"));
  content.push(bodyPara("To democratize scientific discovery by providing every researcher with accessible, powerful, and collaborative computing tools that accelerate breakthrough innovations and advance human knowledge."));
  
  content.push(heading2("2.2 Vision"));
  content.push(bodyPara("We envision a world where geographical location, institutional affiliation, or budget constraints never limit a researcher's ability to pursue groundbreaking science. In this future, AETH-1 serves as the universal platform connecting minds, data, and compute resources across the global scientific community."));
  
  content.push(heading2("2.3 Core Values"));
  
  content.push(heading3("Accessibility First"));
  content.push(bodyPara("Scientific tools should be available to everyone, not just well-funded institutions. We design for inclusivity from the ground up, ensuring our platform serves researchers at all career stages and resource levels."));
  
  content.push(heading3("Reproducibility by Design"));
  content.push(bodyPara("Modern science demands rigorous standards. Every feature we build supports transparent, reproducible research practices that meet the highest academic and regulatory standards."));
  
  content.push(heading3("Community Driven"));
  content.push(bodyPara("Our platform evolves through active engagement with the research community. User feedback directly shapes our roadmap, and open-source contributions are welcomed and rewarded."));
  
  content.push(heading3("Innovation Without Barriers"));
  content.push(bodyPara("We believe the next great discovery shouldn't wait for better software. Our commitment to continuous improvement means researchers always have access to cutting-edge capabilities."));
  
  content.push(heading2("2.4 Company History & Founding Story"));
  content.push(bodyPara("Endeavor Science was founded in 2024 by TestDemo, whose unique background spans both advanced scientific research and enterprise software development. The inspiration for AETH-1 emerged from firsthand experience with the frustrations researchers face when trying to translate innovative ideas into computational reality."));
  content.push(bodyPara("After years of observing talented scientists struggle with incompatible tools, opaque pricing, and inadequate support, the decision was clear: build something better. The company name 'Endeavor' reflects our commitment to the tireless pursuit of scientific advancement, while 'AETH-1' (derived from Aether, the classical element of the heavens) symbolizes our aspiration to elevate human knowledge."));
  
  content.push(heading2("2.5 Strategic Objectives"));
  
  content.push(heading3("Year 1 Goals (Foundation)"));
  content.push(bulletItem("Complete core platform development and launch public beta"));
  content.push(bulletItem("Acquire first 500 active users across academic and early commercial segments"));
  content.push(bulletItem("Establish partnerships with 10 leading research institutions"));
  content.push(bulletItem("Achieve product-market fit validation with measurable user retention metrics"));
  
  content.push(heading3("Year 2-3 Goals (Growth)"));
  content.push(bulletItem("Scale to 5,000+ active users with strong enterprise adoption"));
  content.push(bulletItem("Expand marketplace with 50+ third-party integrations"));
  content.push(bulletItem("Launch in European and Asia-Pacific markets"));
  content.push(bulletItem("Establish AETH-1 as recognized brand in scientific computing"));
  
  content.push(heading3("Year 4-5 Goals (Leadership)"));
  content.push(bulletItem("Achieve market leadership position in key verticals"));
  content.push(bulletItem("Global presence across North America, Europe, and Asia-Pacific"));
  content.push(bulletItem("Strategic acquisitions to expand capability portfolio"));
  content.push(bulletItem("Path to profitability or successful exit opportunity"));
  
  return content;
}

function buildMarketAnalysis() {
  var content = [];
  
  content.push(heading1("3. Market Analysis"));
  
  content.push(heading2("3.1 Industry Overview"));
  content.push(bodyPara("The scientific software industry stands at an inflection point. Traditional desktop-based tools are giving way to cloud-native platforms, driven by increasing dataset sizes, the need for collaborative research, and the democratization of machine learning techniques. The COVID-19 pandemic accelerated digital transformation in research by an estimated 5-7 years, creating unprecedented openness to new technological solutions."));
  content.push(bodyPara("Key industry drivers include: exponential growth in research data volumes requiring sophisticated analysis tools; increased regulatory pressure for reproducibility and audit trails; growing importance of AI/ML in scientific discovery; shift toward remote and distributed research teams; and rising expectations among younger researchers for modern, intuitive software experiences."));
  
  content.push(heading2("3.2 Market Size Analysis"));
  
  content.push(heading3("Total Addressable Market (TAM): $45 Billion"));
  content.push(bodyPara("The TAM encompasses all global spending on scientific software, computational tools, and research IT infrastructure across our target verticals. This includes license fees, cloud computing costs, consulting services, and internal development efforts."));
  
  content.push(heading3("Serviceable Addressable Market (SAM): $18 Billion"));
  content.push(bodyPara("Our SAM focuses on organizations actively seeking modern, cloud-based solutions within our target segments. This excludes deeply entrenched legacy installations and highly specialized niches where our generalist platform would not compete effectively."));
  
  content.push(heading3("Serviceable Obtainable Market (SOM): $900 Million"));
  content.push(bodyPara("Based on realistic market penetration assumptions (5% of SAM by Year 5), competitive dynamics, and go-to-market capacity constraints, our SOM represents achievable revenue opportunity within our planning horizon."));
  
  content.push(createTable(
    ["Market Segment", "TAM", "SAM", "Target SOM (Y5)"],
    [
      ["Academic Research", "$15B", "$6B", "$300M"],
      ["Biotech/Pharma R&D", "$18B", "$7.5B", "$350M"],
      ["Industrial R&D", "$8B", "$3B", "$175M"],
      ["Government/Defense", "$4B", "$1.5B", "$75M"],
      ["TOTAL", "$45B", "$18B", "$900M"]
    ],
    [30, 20, 22, 28]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("3.3 Market Trends and Drivers"));
  
  content.push(heading3("Cloud Migration Acceleration"));
  content.push(bodyPara("Over 65% of research organizations now use or plan to adopt cloud computing within 24 months. Security concerns that previously slowed adoption have been largely addressed through certifications and compliance frameworks."));
  
  content.push(heading3("AI Integration Imperative"));
  content.push(bodyPara("Machine learning capabilities are becoming table stakes in scientific software. Platforms lacking intelligent automation, predictive features, and ML-assisted analysis will face rapid obsolescence."));
  
  content.push(heading3("Collaboration as Competitive Advantage"));
  content.push(bodyPara("Post-pandemic research norms emphasize cross-institutional collaboration. Tools that facilitate seamless teamwork are strongly preferred over isolated workstation software."));
  
  content.push(heading3("Open Science Movement"));
  content.push(bodyPara("Funding agencies increasingly mandate open data and reproducible methods. Platforms supporting these requirements gain preferential consideration in grant applications."));
  
  content.push(heading2("3.4 Target Market Segments"));
  
  content.push(heading3("Academic Research ($15B TAM)"));
  content.push(bodyPara("Universities and research institutes represent our foundational market segment. These users drive adoption through student pipelines, influence industry perceptions, and provide valuable feedback for product development. Price sensitivity is balanced by volume potential and long-term relationship value."));
  
  content.push(heading3("Biotech/Pharma R&D ($18B TAM)"));
  content.push(bodyPara("Pharmaceutical and biotechnology companies offer the largest revenue per customer opportunity. Their complex workflows, regulatory requirements, and competitive pressures create strong demand for sophisticated platforms. Sales cycles are longer but deal sizes justify dedicated enterprise sales efforts."));
  
  content.push(heading3("Industrial R&D ($8B TAM)"));
  content.push(bodyPara("Manufacturing, energy, materials science, and other industrial sectors represent significant opportunity. These customers value reliability, scalability, and integration with existing enterprise systems. Decision-making often involves both technical evaluation and procurement processes."));
  
  content.push(heading3("Government/Defense ($4B TAM)"));
  content.push(bodyPara("Government laboratories and defense contractors require specialized security features, compliance certifications, and sometimes air-gapped deployment options. While sales cycles can be extended, contracts tend to be substantial and multi-year."));
  
  content.push(heading2("3.5 Geographic Analysis"));
  content.push(createTable(
    ["Region", "Market Share", "Priority", "Strategy"],
    [
      ["North America", "40%", "Primary", "Direct sales, conferences, partnerships"],
      ["Europe", "25%", "Secondary", "GDPR-compliant deployment, regional office"],
      ["China", "20%", "Strategic Priority", "Localized version, local partnerships"],
      ["Rest of World", "15%", "Emerging", "Channel partners, online-first approach"]
    ],
    [22, 18, 20, 40]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("3.6 China Market Deep-Dive"));
  content.push(bodyPara("China represents our most important strategic international opportunity. The country's R&D spending has grown at 10%+ annually, reaching over $500 billion in 2024. Government initiatives like 'Made in China 2025' prioritize domestic innovation in biotechnology, materials science, and artificial intelligence."));
  content.push(bodyPara("Our China strategy includes: establishing a Beijing-based subsidiary within 24 months; partnering with leading Chinese universities and research institutes; ensuring full compliance with cybersecurity and data localization regulations; offering Chinese language interface and localized documentation; and building relationships with government technology programs."));
  content.push(bodyPara("Success in China requires deep cultural understanding, patience in relationship-building, and commitment to long-term presence. We view this as a 5-year investment horizon with substantial returns expected in Years 4-5 and beyond."));
  
  return content;
}

function buildProblemStatement() {
  var content = [];
  
  content.push(heading1("4. Problem Statement"));
  
  content.push(heading2("4.1 Current State of Scientific Software"));
  content.push(bodyPara("The scientific software landscape today is characterized by fragmentation, exclusivity, and inefficiency. Researchers must typically cobble together multiple specialized tools, each with its own interface, data format, licensing model, and learning curve. This patchwork approach creates friction at every stage of the research workflow."));
  content.push(bodyPara("Legacy solutions dominate many domains, with some flagship products tracing their origins to the 1980s and 1990s. While these tools have evolved incrementally, their fundamental architectures were designed for single-user, desktop-centric computing models that poorly match contemporary research practices."));
  
  content.push(heading2("4.2 Pain Points by Stakeholder Type"));
  
  content.push(heading3("Individual Researchers"));
  content.push(bulletItem("Prohibitive license costs ($5,000-$50,000+ per seat for professional tools)"));
  content.push(bulletItem("Steep learning curves requiring weeks of dedicated training"));
  content.push(bulletItem("Limited access to computational resources for intensive analyses"));
  content.push(bulletItem("Difficulty reproducing own results due to undocumented parameters"));
  content.push(bulletItem("Time wasted on data format conversion between tools"));
  
  content.push(heading3("Research Teams & Labs"));
  content.push(bulletItem("License management overhead and compliance tracking"));
  content.push(bulletItem("Version control challenges for shared projects"));
  content.push(bulletItem("Difficulty standardizing workflows across team members"));
  content.push(bulletItem("Collaboration bottlenecks when sharing intermediate results"));
  content.push(bulletItem("Onboarding delays for new team members"));
  
  content.push(heading3("Institutional Leadership"));
  content.push(bulletItem("Unpredictable total cost of ownership across departments"));
  content.push(bulletItem("Security concerns with scattered data storage"));
  content.push(bulletItem("Vendor lock-in limiting negotiating leverage"));
  content.push(bulletItem("Difficulty assessing ROI on software investments"));
  content.push(bulletItem("Integration challenges with existing IT infrastructure"));
  
  content.push(heading2("4.3 Cost of the Problem (Quantified)"));
  content.push(bodyPara("Our research and industry surveys reveal staggering inefficiencies attributable to current software limitations:"));
  content.push(createTable(
    ["Impact Category", "Estimated Annual Cost", "Source Basis"],
    [
      ["Lost researcher productivity", "$12B globally", "Survey extrapolation"],
      ["Redundant license spending", "$4B globally", "Industry benchmarking"],
      ["Failed reproduction attempts", "$3B globally", "Published estimates"],
      ["Extended time-to-discovery", "$8B globally", "Opportunity cost model"],
      ["Collaboration friction losses", "$2B globally", "Survey extrapolation"]
    ],
    [35, 30, 35]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  content.push(bodyPara("For a typical mid-sized research lab with 50 researchers, we estimate annual software-related inefficiency costs exceeding $750,000 in direct expenses and lost productivity. This represents approximately 15-20% of total research operating budgets."));
  
  content.push(heading2("4.4 Market Validation Evidence"));
  content.push(bodyPara("Strong evidence supports the market need for AETH-1:"));
  content.push(bulletItem("Interviews with 150+ researchers across 12 countries confirming pain points"));
  content.push(bulletItem("Pilot program with 3 universities showing 40% productivity improvement"));
  content.push(bulletItem("Waitlist of 2,000+ researchers expressing interest in beta access"));
  content.push(bulletItem("Competitor analysis revealing gaps in usability and accessibility"));
  content.push(bulletItem("Industry analyst reports projecting 15%+ annual market growth"));
  content.push(bulletItem("Grant funding trends favoring open, reproducible research tools"));
  
  return content;
}

function buildSolution() {
  var content = [];
  
  content.push(heading1("5. Solution - The AETH-1 Platform"));
  
  content.push(heading2("5.1 Product Overview"));
  content.push(bodyPara("AETH-1 is a cloud-native scientific computing platform designed from the ground up for modern research workflows. Unlike legacy tools retrofitted for cloud environments, AETH-1 was conceived as a distributed system, leveraging contemporary architecture patterns to deliver performance, reliability, and user experience that established competitors cannot match."));
  content.push(bodyPara("The platform provides a unified environment where researchers can: import and preprocess diverse data types; perform statistical analysis and visualization; run simulations and molecular modeling; apply machine learning algorithms; collaborate with team members in real-time; document methods and ensure reproducibility; and publish results with integrated reporting tools."));
  
  content.push(heading2("5.2 Key Features and Capabilities"));
  
  content.push(heading3("Unified Workspace"));
  content.push(bodyPara("A single interface supporting multiple scientific disciplines eliminates context-switching overhead. Researchers stay focused on science rather than tool management."));
  
  content.push(heading3("Intelligent Automation"));
  content.push(bodyPara("AI-powered features suggest appropriate analyses, detect anomalies, automate repetitive tasks, and learn from user behavior to improve recommendations over time."));
  
  content.push(heading3("Collaboration Suite"));
  content.push(bodyPara("Real-time co-editing, shared notebooks, comment threads, activity feeds, and permission management enable seamless teamwork regardless of physical location."));
  
  content.push(heading3("Compute Orchestrator"));
  content.push(bodyPara("Transparent workload distribution across available resources optimizes cost and performance. Users simply specify requirements; the platform handles execution details."));
  
  content.push(heading3("Reproducibility Engine"));
  content.push(bodyPara("Automatic capture of parameters, data versions, environment specifications, and computational provenance ensures every result can be faithfully reproduced."));
  
  content.push(heading3("Integration Hub"));
  content.push(bodyPara("REST APIs, Python/R/MATLAB SDKs, and plugin architecture enable connection to existing instruments, databases, and organizational systems."));
  
  content.push(heading2("5.3 User Experience Walkthrough"));
  content.push(bodyPara("A typical AETH-1 session demonstrates the platform's design philosophy:"));
  content.push(bulletItem("Login via SSO or institutional credentials (10 seconds)"));
  content.push(bulletItem("Select project from dashboard showing recent activity and team updates"));
  content.push(bulletItem("Open notebook with previous session automatically restored"));
  content.push(bulletItem("Import new dataset via drag-and-drop or connected data source"));
  content.push(bulletItem("Receive automated suggestions for preprocessing and analysis options"));
  content.push(bulletItem("Execute analysis with visual progress indication and resource monitoring"));
  content.push(bulletItem("Share results link with collaborators who can view and comment"));
  content.push(bulletItem("Export publication-ready figures with one click"));
  content.push(bodyPara("This streamlined workflow reduces typical analysis time by 40-60% compared to conventional toolchains, based on our pilot studies."));
  
  content.push(heading2("5.4 Technical Architecture Overview"));
  content.push(bodyPara("AETH-1 employs a modern microservices architecture deployed on Kubernetes clusters across multiple cloud regions:"));
  
  content.push(heading3("Frontend Layer"));
  content.push(bodyPara("React-based SPA with WebGL visualizations, offline-capable components, and responsive design for desktop and tablet interfaces."));
  
  content.push(heading3("API Gateway"));
  content.push(bodyPara("Rate-limited, authenticated routing to backend services with request validation, caching, and audit logging."));
  
  content.push(heading3("Core Services"));
  content.push(bodyPara("User management, project organization, data catalog, workflow orchestration, collaboration, and notification services implemented as independent scalable microservices."));
  
  content.push(heading3("Compute Layer"));
  content.push(bodyPara("Containerized execution environments supporting Python, R, Julia, and custom binaries. Auto-scaling based on queue depth and priority."));
  
  content.push(heading3("Data Layer"));
  content.push(bodyPara("Object storage for datasets, time-series database for metrics, graph database for relationships, and search index for discoverability."));
  
  content.push(heading2("5.5 Competitive Differentiation"));
  content.push(createTable(
    ["Capability", "AETH-1", "Legacy Competitors", "Cloud-Native Alternatives"],
    [
      ["Unified Interface", "Full", "Limited", "Partial"],
      ["AI Assistance", "Built-in", "None/Basic", "Varies"],
      ["Pricing Model", "Flexible tiers", "Perpetual licenses", "Usage-based only"],
      ["Onboarding Time", "< 1 hour", "Weeks-Months", "Days"],
      ["Collaboration", "Real-time", "File-based", "Basic"],
      ["Reproducibility", "Automatic", "Manual", "Partial"]
    ],
    [25, 25, 27, 23]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  return content;
}

function buildBusinessModel() {
  var content = [];
  
  content.push(heading1("6. Business Model"));
  
  content.push(heading2("6.1 Revenue Streams"));
  
  content.push(heading3("Subscription Tiers"));
  content.push(bodyPara("Four subscription levels serve different user segments:"));
  content.push(createTable(
    ["Tier", "Price", "Target User", "Key Features"],
    [
      ["Free", "$0", "Students, hobbyists", "Basic analysis, community support, limited storage"],
      ["Pro", "$49/mo", "Individual professionals", "Advanced features, priority support, 100GB storage"],
      ["Team", "$199/mo/5 seats", "Small research groups", "Collaboration suite, admin console, shared resources"],
      ["Enterprise", "Custom", "Large organizations", "SSO, SLA, dedicated support, custom integrations"]
    ],
    [14, 20, 28, 38]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading3("Compute Credits"));
  content.push(bodyPara("Heavy computational workloads beyond subscription allowances are billed via prepaid or postpaid compute credits. This consumption-based model aligns costs with actual usage while providing predictable budgeting for regular users."));
  
  content.push(heading3("Marketplace Commissions"));
  content.push(bodyPara("Third-party developers can publish tools, datasets, and templates on the AETH-1 Marketplace. Endeavor Science earns 20-30% commission on transactions, creating a platform ecosystem effect."));
  
  content.push(heading3("Training & Certification"));
  content.push(bodyPara("Official AETH-1 certification programs generate revenue while expanding the skilled user base. Corporate training packages provide higher-margin B2B revenue."));
  
  content.push(heading3("Professional Services"));
  content.push(bodyPara("Custom implementations, workflow migration, and dedicated consulting engagements serve enterprise clients with specialized requirements. Targeting 15-20% gross margin contribution."));
  
  content.push(heading2("6.2 Pricing Strategy"));
  content.push(bodyPara("Our pricing philosophy balances accessibility with sustainability: Free tier ensures no researcher is excluded for financial reasons; Pro tier provides affordable individual access below competitor pricing; Team tier encourages organizational adoption with per-seat economies; Enterprise tier captures maximum value from large deployments with premium services."));
  content.push(bodyPara("Competitive positioning places AETH-1 Pro at 40-60% below equivalent legacy tool costs while delivering superior functionality. This aggressive pricing drives adoption during market entry phase."));
  
  content.push(heading2("6.3 Unit Economics"));
  content.push(createTable(
    ["Metric", "Value", "Notes"],
    [
      ["Customer Acquisition Cost (CAC)", "$850", "Blended across channels"],
      ["Customer Lifetime Value (LTV)", "$4,200", "Based on 36-month avg retention"],
      ["LTV:CAC Ratio", "4.9:1", "Target >3:1 for healthy unit economics"],
      ["Gross Margin", "78%", "Excluding compute pass-through costs"],
      ["Net Revenue Retention", "115%", "Expansion revenue offsets churn"]
    ],
    [35, 22, 43]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("6.4 Financial Projections (5 Years)"));
  content.push(createTable(
    ["Metric", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
    [
      ["Revenue", "$1.2M", "$4.7M", "$18M", "$42M", "$85M"],
      ["Subscription", "$0.7M", "$3.2M", "$13M", "$31M", "$62M"],
      ["Compute/Other", "$0.5M", "$1.5M", "$5M", "$11M", "$23M"],
      ["Gross Profit", "$0.9M", "$3.7M", "$14M", "$33M", "$70M"],
      ["Operating Expenses", "$4.5M", "$9M", "$18M", "$32M", "$55M"],
      ["Net Income", "($3.3M)", "($5.3M)", "($4M)", "$1M", "$15M"]
    ],
    [22, 13, 13, 16, 17, 19]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  content.push(bodyPara("Path to profitability is achieved in Year 4, with accelerating positive income thereafter. Break-even analysis indicates monthly recurring revenue target of $3.2M for sustainable operations."));
  
  return content;
}

function buildGoToMarket() {
  var content = [];
  
  content.push(heading1("7. Go-to-Market Strategy"));
  
  content.push(heading2("7.1 Sales and Distribution Model"));
  
  content.push(heading3("Self-Serve (Free/Pro Tiers)"));
  content.push(bodyPara("Website-driven acquisition with freemium conversion funnel. Product-led growth strategy where users experience value before purchasing. Target: 70% of Pro subscriptions via self-serve."));
  
  content.push(heading3("Inside Sales (Team Tier)"));
  content.push(bodyPara("Remote sales development representatives qualify leads and close Team deals up to $25K ACV. Focus on research groups and small companies. Target: 80% of Team revenue via inside sales."));
  
  content.push(heading3("Field Sales (Enterprise)"));
  content.push(bodyPara("Regional account executives manage strategic accounts with $100K+ potential ACV. Longer sales cycles (6-18 months) justified by deal sizes. Target: 95% of Enterprise revenue via field sales."));
  
  content.push(heading3("Channel Partners"));
  content.push(bodyPara("Systems integrators and resellers extend reach in specific verticals and geographies. Partner program includes training, deal registration, and margin structures."));
  
  content.push(heading2("7.2 Marketing Approach"));
  
  content.push(heading3("Content Marketing"));
  content.push(bodyPara("Technical blog posts, whitepapers, webinars, and video tutorials establish thought leadership and drive organic search traffic. Target: 40% of qualified leads from content."));
  
  content.push(heading3("Academic Outreach"));
  content.push(bodyPara("Conference sponsorships, journal advertising, and professor ambassador programs build credibility in research community. Free academic licenses create pipeline for future commercial adoption."));
  
  content.push(heading3("Digital Advertising"));
  content.push(bodyPara("Targeted LinkedIn and Google campaigns reach researchers and decision-makers. Retargeting nurtures prospects through consideration phase."));
  
  content.push(heading3("Community Building"));
  content.push(bodyPara("User forums, Slack/Discord communities, and annual user conference foster engagement and loyalty. Active community reduces support costs and drives word-of-mouth referrals."));
  
  content.push(heading2("7.3 Partnership Strategy"));
  
  content.push(heading3("Technology Partnerships"));
  content.push(bodyPara("Integrations with major instrument manufacturers, database providers, and complementary software vendors expand platform utility and distribution."));
  
  content.push(heading3("Academic Partnerships"));
  content.push(bodyPara("University alliances provide feedback, case studies, and graduate pipeline. Research consortium memberships establish credibility."));
  
  content.push(heading3("Cloud Partnerships"));
  content.push(bodyPara("Relationships with AWS, Azure, and GCP ensure optimal infrastructure access, co-marketing opportunities, and preferred pricing."));
  
  content.push(heading2("7.4 Customer Acquisition Plan"));
  content.push(createTable(
    ["Quarter", "Focus", "Target New Customers", "Primary Channel"],
    [
      ["Q1-Y1", "Beta launch", "100", "Academic outreach"],
      ["Q2-Y1", "Product refinement", "150", "Content marketing"],
      ["Q3-Y1", "Commercial launch", "200", "Digital advertising"],
      ["Q4-Y1", "Enterprise pilots", "50", "Field sales"],
      ["Y2", "Scale growth", "1,500", "Multi-channel"],
      ["Y3", "Market expansion", "2,500", "Partnerships"]
    ],
    [15, 28, 28, 29]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("7.5 Phased Launch Roadmap"));
  
  content.push(heading3("Phase 1: Foundation (Months 1-6)"));
  content.push(bodyPara("Complete core platform development, initiate closed beta with partner institutions, establish support infrastructure, and refine product based on early feedback."));
  
  content.push(heading3("Phase 2: Launch (Months 7-12)"));
  content.push(bodyPara("Public beta release, activate marketing campaigns, onboard initial paying customers, and iterate rapidly based on usage analytics."));
  
  content.push(heading3("Phase 3: Scale (Year 2)"));
  content.push(bodyPara("Expand sales team, launch marketplace, enter European market, and develop enterprise features for larger deployments."));
  
  content.push(heading3("Phase 4: Growth (Years 3-5)"));
  content.push(bodyPara("International expansion, strategic acquisitions, platform ecosystem maturation, and path to market leadership position."));
  
  return content;
}

function buildCompetitiveLandscape() {
  var content = [];
  
  content.push(heading1("8. Competitive Landscape"));
  
  content.push(heading2("8.1 Direct Competitors Analysis"));
  content.push(createTable(
    ["Competitor", "Strengths", "Weaknesses", "Market Position"],
    [
      ["Legacy Vendor A", "Brand recognition, installed base", "Outdated UX, high pricing", "Declining (-5% YoY)"],
      ["Legacy Vendor B", "Deep domain expertise", "Cloud transition struggles", "Stable (0% YoY)"],
      ["Cloud Startup X", "Modern tech stack", "Narrow focus, funding risk", "Growing (+25% YoY)"],
      ["Open Source Y", "Free, flexible", "No enterprise support", "Niche adoption"]
    ],
    [20, 30, 30, 20]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("8.2 Indirect Competitors"));
  content.push(bodyPara("Beyond direct alternatives, researchers may choose: in-house developed solutions (common in large pharma); general-purpose tools like Excel or Python IDEs; consulting firms offering custom analysis; or simply accepting reduced analytical capabilities. Each alternative has tradeoffs that AETH-1 addresses."));
  
  content.push(heading2("8.3 Competitive Positioning Matrix"));
  content.push(bodyPara("AETH-1 occupies a unique position combining: modern cloud architecture (unlike legacy vendors); broad disciplinary coverage (unlike niche startups); enterprise readiness (unlike pure open source); and accessible pricing (unlike premium competitors)."));
  content.push(bodyPara("This positioning allows us to compete on multiple dimensions depending on buyer priorities: price-sensitive academics see value versus expensive legacy tools; enterprise buyers appreciate modern architecture and support; and all users benefit from superior user experience."));
  
  content.push(heading2("8.4 Competitive Moat / Barriers to Entry"));
  
  content.push(heading3("Network Effects"));
  content.push(bodyPara("As the user base grows, collaboration features become more valuable, marketplace offerings increase, and community resources expand. Each new user adds value to the network."));
  
  content.push(heading3("Switching Costs"));
  content.push(bodyPara("Migrated workflows, trained personnel, historical data, and integrations create meaningful costs to leave the platform once adopted."));
  
  content.push(heading3("Data Network Effects"));
  content.push(bodyPara("Aggregated anonymized usage data improves AI features, benchmark comparisons, and recommendation quality over time."));
  
  content.push(heading3("Brand & Trust"));
  content.push(bodyPara("Scientific tools require high trust. Established reputation for accuracy, reliability, and support creates barrier against unproven entrants."));
  
  content.push(heading3("Ecosystem Lock-In"));
  content.push(bodyPara("Marketplace, integrations, and certified user base create ecosystem value difficult for competitors to replicate quickly."));
  
  return content;
}

function buildTeam() {
  var content = [];
  
  content.push(heading1("9. The Team"));
  
  content.push(heading2("9.1 Founding Team - TestDemo Credentials"));
  content.push(bodyPara("TestDemo brings a rare and powerful combination of deep scientific expertise and comprehensive engineering skills that uniquely positions Endeavor Science to succeed in the scientific software market."));
  
  content.push(heading3("Scientific Background"));
  content.push(bodyPara("Postgraduate-level expertise across multiple disciplines:"));
  content.push(bulletItem("Molecular Biology - Understanding of genomics, proteomics, drug discovery workflows"));
  content.push(bulletItem("Bioinformatics - Experience with sequence analysis, structural biology, pathway modeling"));
  content.push(bulletItem("Chemistry - Knowledge of computational chemistry, molecular dynamics, quantum chemistry"));
  content.push(bulletItem("Computational Physics - Expertise in simulation methods, numerical algorithms, HPC"));
  content.push(bulletItem("Data Science - Proficiency in statistics, machine learning, big data analytics"));
  
  content.push(heading3("Software Engineering Capabilities"));
  content.push(bodyPara("Full-stack engineering proficiency spanning the entire technology spectrum:"));
  content.push(bulletItem("Systems Programming - Assembly, C, Fortran for performance-critical components"));
  content.push(bulletItem("Enterprise Platforms - JVM internals, memory management, garbage collection tuning"));
  content.push(bulletItem("Functional Programming - Haskell, Erlang, Clojure for reliable distributed systems"));
  content.push(bulletItem("Big Data Technologies - Apache Spark, Kafka, distributed processing at scale"));
  content.push(bulletItem("Modern Web Development - React, Next.js, Go for responsive applications"));
  content.push(bulletItem("Cloud Infrastructure - Kubernetes, Docker, CI/CD, multi-cloud deployment"));
  
  content.push(heading3("Unique Value Proposition"));
  content.push(bodyPara("This combination of deep science AND full-stack engineering is exceptionally rare. Most scientific software companies are founded by either scientists who struggle with scalable engineering, or engineers who lack domain understanding. TestDemo bridges this gap, enabling authentic communication with users while building robust, scalable technology."));
  
  content.push(heading2("9.2 Advisory Board Targets"));
  content.push(bodyPara("We are recruiting advisory board members with complementary expertise:"));
  content.push(bulletItem("Former CTO of major scientific software company (scaling experience)"));
  content.push(bulletItem("Prominent academic researcher (credibility and user insight)"));
  content.push(bulletItem("Enterprise software sales veteran (go-to-market expertise)"));
  content.push(bulletItem("Venture capitalist with B2B SaaS portfolio (fundraising guidance)"));
  content.push(bulletItem("Regulatory/compliance expert (pharma/healthcare vertical knowledge)"));
  
  content.push(heading2("9.3 Hiring Plan"));
  content.push(createTable(
    ["Role", "Headcount Y1", "Headcount Y3", "Priority"],
    [
      ["Engineering", "8", "35", "Critical"],
      ["Product/Design", "3", "12", "High"],
      ["Sales/Marketing", "4", "20", "High"],
      ["Customer Success", "3", "15", "Medium"],
      ["Operations", "2", "8", "Medium"],
      ["Total", "20", "90", "-"]
    ],
    [28, 22, 22, 28]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("9.4 Organizational Structure"));
  content.push(bodyPara("Endeavor Science maintains a flat organizational structure optimized for speed and innovation: Engineering, Product, and Commercial functions report directly to CEO. Cross-functional pods form around major initiatives. Regular all-hands meetings ensure alignment. Distributed-first culture enables talent acquisition regardless of geography."));
  
  return content;
}

function buildFinancialProjections() {
  var content = [];
  
  content.push(heading1("10. Financial Projections"));
  
  content.push(heading2("10.1 Five-Year P&L Summary"));
  content.push(createTable(
    ["($ thousands)", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
    [
      ["Subscription Revenue", "700", "3,200", "13,000", "31,000", "62,000"],
      ["Compute/Other Revenue", "500", "1,500", "5,000", "11,000", "23,000"],
      ["Total Revenue", "1,200", "4,700", "18,000", "42,000", "85,000"],
      ["Cost of Revenue", "(264)", "(1,034)", "(3,960)", "(9,240)", "(18,700)"],
      ["Gross Profit", "936", "3,666", "14,040", "32,760", "66,300"],
      ["Sales & Marketing", "(1,800)", "(4,000)", "(8,000)", "(14,000)", "(22,000)"],
      ["Research & Development", "(2,000)", "(3,500)", "(7,000)", "(12,000)", "(20,000)"],
      ["General & Administrative", "(700)", "(1,500)", "(3,000)", "(6,000)", "(13,000)"],
      ["Total Operating Exp", "(4,500)", "(9,000)", "(18,000)", "(32,000)", "(55,000)"],
      ["Operating Income", "(3,564)", "(5,334)", "(3,960)", "760", "11,300"],
      ["Interest/Other", "264", "334", "960", "(260)", "3,700"],
      ["Net Income", "(3,300)", "(5,000)", "(3,000)", "500", "15,000"]
    ],
    [28, 12, 14, 16, 16, 14]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("10.2 Key Assumptions"));
  
  content.push(heading3("Revenue Assumptions"));
  content.push(bulletItem("Average contract value: Pro $588/year, Team $2,388/year, Enterprise $50,000+/year"));
  content.push(bulletItem("Customer growth: 450 (Y1) -> 1,200 (Y2) -> 4,200 (Y3) -> 9,000 (Y4) -> 18,500 (Y5)"));
  content.push(bulletItem("Churn rate: 5% (Enterprise), 8% (Team), 12% (Pro), improving over time"));
  content.push(bulletItem("Net revenue retention: 115%+ driven by upsells and expansion"));
  
  content.push(heading3("Cost Assumptions"));
  content.push(bulletItem("Gross margin: 78% at scale (compute pass-through at cost)"));
  content.push(bulletItem("Sales efficiency: CAC payback <18 months for all segments"));
  content.push(bulletItem("R&D investment: 25-30% of revenue (innovation priority)"));
  content.push(bulletItem("G&A efficiency: leverage operating scale as company grows"));
  
  content.push(heading2("10.3 Funding Requirements"));
  
  content.push(heading3("Seed Round: $5M (Current Round)"));
  content.push(bodyPara("Use of funds: 50% Product Development, 25% Go-to-Market, 15% Operations, 10% Reserve. Runway: 18 months to Series A milestone."));
  
  content.push(heading3("Series A: $15-25M (Months 18-24)"));
  content.push(bodyPara("Use of funds: 40% Sales & Marketing Scale, 30% Product Expansion, 20% International, 10% G&A. Runway: 24 months to profitability indicators."));
  
  content.push(heading3("Series B: $50-80M (Year 4)"));
  content.push(bodyPara("Use of funds: 35% Strategic Acquisitions, 30% Global Expansion, 20% Platform Investment, 15% Working Capital. Runway: Path to IPO or strategic exit."));
  
  content.push(createTable(
    ["Use of Funds", "Seed ($5M)", "Series A ($20M)", "Series B ($65M)"],
    [
      ["Product Development", "$2.5M (50%)", "$6M (30%)", "$13M (20%)"],
      ["Sales & Marketing", "$1.25M (25%)", "$8M (40%)", "$13M (20%)"],
      ["Operations/G&A", "$0.75M (15%)", "$2M (10%)", "$10M (15%)"],
      ["Reserve/Cushion", "$0.5M (10%)", "$2M (10%)", "$6.5M (10%)"],
      ["International", "-", "$2M (10%)", "$13M (20%)"],
      ["Acquisitions", "-", "-", "$22.5M (35%)"]
    ],
    [28, 24, 24, 24]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("10.4 Exit Strategy / ROI Potential"));
  content.push(bodyPara("Investment return scenarios based on comparable company valuations:"));
  content.push(bulletItem("Conservative Case (3x return): Acquisition by legacy vendor or enterprise software company at $150-200M valuation"));
  content.push(bulletItem("Base Case (8x return): IPO or strategic acquisition at $400-600M valuation upon achieving market leadership position"));
  content.push(bulletItem("Upside Case (15x+ return): Category-defining platform commanding $1B+ valuation in expanded market opportunity"));
  content.push(bodyPara("Timeline: Likely exit window 5-7 years from seed, contingent on market conditions and execution."));
  
  return content;
}

function buildRiskAnalysis() {
  var content = [];
  
  content.push(heading1("11. Risk Analysis"));
  
  content.push(heading2("11.1 Key Risks with Mitigation Strategies"));
  
  content.push(createTable(
    ["Risk Category", "Probability", "Impact", "Mitigation Strategy"],
    [
      ["Competition from incumbents", "High", "Medium", "Speed of innovation, UX differentiation, switching incentives"],
      ["Slower enterprise adoption", "Medium", "High", "Strong SMB/academic foundation, proof points, reference customers"],
      ["Technical execution challenges", "Medium", "High", "Experienced team, agile methodology, phased delivery"],
      ["Capital market downturn", "Low", "High", "Conservative runway, path to profitability focus"],
      ["Talent acquisition difficulty", "Medium", "Medium", "Strong employer brand, remote-friendly, equity participation"],
      ["Data security incident", "Low", "Very High", "Security-first architecture, audits, insurance, response plans"],
      ["Regulatory changes", "Low", "Medium", "Compliance-by-design, regulatory monitoring, adaptable policies"]
    ],
    [28, 14, 14, 44]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("11.2 Risk Matrix (Probability vs Impact)"));
  content.push(bodyPara("Our risk assessment framework prioritizes mitigation efforts based on combined probability and impact scores. High-priority risks receive dedicated monitoring and contingency planning. The executive team reviews risk status monthly with quarterly board updates."));
  
  return content;
}

function buildAppendix() {
  var content = [];
  
  content.push(heading1("12. Appendix"));
  
  content.push(heading2("12.1 Glossary of Terms"));
  content.push(createTable(
    ["Term", "Definition"],
    [
      ["ARR", "Annual Recurring Revenue - yearly subscription revenue normalized for contracts"],
      ["CAC", "Customer Acquisition Cost - total sales/marketing spend divided by new customers"],
      ["Churn Rate", "Percentage of customers who cancel within a given period"],
      ["LTV", "Lifetime Value - predicted net profit from entire customer relationship"],
      ["NRR", "Net Revenue Retention - revenue change accounting for expansions and contractions"],
      ["SAM", "Serviceable Addressable Market - portion of TAM reachable with current model"],
      ["SOM", "Serviceable Obtainable Market - realistically achievable share of SAM"],
      ["TAM", "Total Addressable Market - total market demand for product category"],
      ["SaaS", "Software as a Service - cloud-based software delivery model"],
      ["ACV", "Annual Contract Value - average annual revenue per customer contract"]
    ],
    [22, 78]
  ));
  content.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  
  content.push(heading2("12.2 References"));
  content.push(bodyPara("Industry data sourced from: IDC Scientific Software Market Analysis (2024); Gartner Market Guide for Scientific R&D Software; CB Insights State of Venture Report; proprietary Endeavor Science market surveys (n=150+); and publicly available company filings."));
  
  content.push(heading2("12.3 Contact Information"));
  content.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
  content.push(bodyParaNoIndent("Endeavor Science Inc."));
  content.push(bodyParaNoIndent("Founder: TestDemo"));
  content.push(bodyParaNoIndent("Email: testdemoqwenai2025@gmail.com"));
  content.push(bodyParaNoIndent("Document Date: August 2026"));
  content.push(bodyParaNoIndent("Classification: Confidential - For Investor Review"));
  
  return content;
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT ASSEMBLY
// ══════════════════════════════════════════════════════════════════════════════

// Build all section content arrays
var execSummary = buildExecutiveSummary();
var companyOverview = buildCompanyOverview();
var marketAnalysis = buildMarketAnalysis();
var problemStatement = buildProblemStatement();
var solution = buildSolution();
var businessModel = buildBusinessModel();
var goToMarket = buildGoToMarket();
var competitiveLandscape = buildCompetitiveLandscape();
var team = buildTeam();
var financialProjections = buildFinancialProjections();
var riskAnalysis = buildRiskAnalysis();
var appendix = buildAppendix();

// Combine all body content
var bodyContent = [];
for (var e = 0; e < execSummary.length; e++) { bodyContent.push(execSummary[e]); }
for (var c = 0; c < companyOverview.length; c++) { bodyContent.push(companyOverview[c]); }
for (var m = 0; m < marketAnalysis.length; m++) { bodyContent.push(marketAnalysis[m]); }
for (var p = 0; p < problemStatement.length; p++) { bodyContent.push(problemStatement[p]); }
for (var s = 0; s < solution.length; s++) { bodyContent.push(solution[s]); }
for (var b = 0; b < businessModel.length; b++) { bodyContent.push(businessModel[b]); }
for (var g = 0; g < goToMarket.length; g++) { bodyContent.push(goToMarket[g]); }
for (var l = 0; l < competitiveLandscape.length; l++) { bodyContent.push(competitiveLandscape[l]); }
for (var t = 0; t < team.length; t++) { bodyContent.push(team[t]); }
for (var f = 0; f < financialProjections.length; f++) { bodyContent.push(financialProjections[f]); }
for (var r = 0; r < riskAnalysis.length; r++) { bodyContent.push(riskAnalysis[r]); }
for (var a = 0; a < appendix.length; a++) { bodyContent.push(appendix[a]); }

// Build cover page
var coverConfig = {
  palette: P,
  title: "Endeavor Science (AETH-1)",
  subtitle: "Business Plan",
  englishLabel: "DEMOCRATIZING SCIENTIFIC DISCOVERY",
  metaLines: [
    "Founder: TestDemo",
    "Email: testdemoqwenai2025@gmail.com",
    "August 2026"
  ],
  footerLeft: "Classification: Confidential",
  footerRight: "For Investor Review Only"
};

var coverContent = buildCoverR4(coverConfig);

var doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" }, size: 24, color: stripHash(bodyPalette.body) },
        paragraph: { spacing: { line: 312 } }
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: stripHash(bodyPalette.primary) },
        paragraph: { spacing: { before: 360, after: 200, line: 312 } }
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: stripHash(bodyPalette.primary) },
        paragraph: { spacing: { before: 280, after: 160, line: 312 } }
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: stripHash(bodyPalette.primary) },
        paragraph: { spacing: { before: 240, after: 120, line: 312 } }
      }
    }
  },
  sections: [
    // Section 1: Cover Page
    {
      properties: {
        page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } }
      },
      children: coverContent
    },
    
    // Section 2: Front Matter (TOC)
    {
      properties: {
        type: "NextPage",
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN }
        }
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "PAGE ", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 })]
          })]
        })
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 360 },
          children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, font: { ascii: "Calibri", eastAsia: "SimHei" } })]
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-3"
        }),
        new Paragraph({
          spacing: { before: 200 },
          children: [new TextRun({
            text: "Note: Right-click this Table of Contents and select \"Update Field\" to refresh page numbers.",
            italics: true, size: 18, color: "888888"
          })]
        }),
        new Paragraph({ children: [new PageBreak()] })
      ]
    },
    
    // Section 3: Body Content
    {
      properties: {
        type: "NextPage",
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Endeavor Science (AETH-1) - Business Plan", size: 18, color: "888888" })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18 })]
          })]
        })
      },
      children: bodyContent
    }
  ]
});

// Generate Document
var outputPath = "/home/z/my-project/download/Endeavor_Science_Business_Plan.docx";
Packer.toBuffer(doc).then(function(buffer) {
  fs.writeFileSync(outputPath, buffer);
  console.log("Document saved to: " + outputPath);
}).catch(function(err) {
  console.error("Error generating document:", err);
});
