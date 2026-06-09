export interface InterviewAnswer {
  id: number;
  answerId: number;
  answerName: string;
  answerParentId?: number | null;
  sectionId?: number | null;
  questionId?: number | null;
  checkValue?: boolean;
  selectValue?: boolean;
  ratingValue?: number;
  textValue?: string;
  allowCheck?: boolean;
  allowSelect?: boolean;
  allowRating?: boolean;
  allowText?: boolean;
  childs?: InterviewAnswer[];
}

export interface InterviewQuestion {
  id: number;
  questionId: number;
  questionName: string;
  sectionId?: number;
  answers?: InterviewAnswer[];
}

export interface InterviewDetail {
  id: number;
  employeeCode: string;
  employeeName: string;
  jobPositionName: string;
  organizationId?: number;
  organizationName: string;
  exitedAt: string | null;
  createdAt: string | null;
  sections?: InterviewSection[];
}

export interface InterviewSection {
  id: number;
  sectionId: number;
  sectionName: string;
  sectionParentId: number | null;
  answers?: InterviewAnswer[];
  questions?: InterviewQuestion[];
  childs?: InterviewSection[];
}

export interface SectionMeta {
  sectionId: number;
  sectionName: string;
  sectionParentId: number | null;
}

export interface FlatAnswerRow {
  rootSectionId: number;
  rootSectionName: string;
  parentSectionId: number | null;
  parentSectionName: string | null;
  sectionId: number;
  sectionName: string;
  questionId: number | null;
  questionName: string | null;
  answerId: number;
  answerName: string;
  source: string;
  displayValue: string;
  raw: InterviewAnswer;
}

export const findSectionBySectionId = (
  sections: InterviewSection[] = [],
  sectionId: number
): InterviewSection | null => {
  for (const section of sections) {
    if (section.sectionId === sectionId) return section;
    for (const child of section.childs ?? []) {
      const found = findSectionBySectionId([child], sectionId);
      if (found) return found;
    }
  }
  return null;
};

/** Lấy tất cả section con có sectionParentId = parentSectionId (đệ quy toàn cây) */
export const getSectionsByParentId = (
  sections: InterviewSection[] = [],
  parentSectionId: number
): InterviewSection[] => {
  const result: InterviewSection[] = [];

  const walk = (list: InterviewSection[]) => {
    for (const section of list) {
      if (section.sectionParentId === parentSectionId) {
        result.push(section);
      }
      if (section.childs?.length) {
        walk(section.childs);
      }
    }
  };

  walk(sections);
  return result;
};

/** Full answers thuộc các section con của parentSectionId (không lọc hasAnswerData) */
export const collectFullAnswersByParentSectionId = (
  sections: InterviewSection[] = [],
  parentSectionId: number
): {
  parentSection: InterviewSection | null;
  childSections: InterviewSection[];
  allAnswers: InterviewAnswer[];
} => {
  const parentSection = findSectionBySectionId(sections, parentSectionId);
  const childSections = getSectionsByParentId(sections, parentSectionId);
  const allAnswers: InterviewAnswer[] = [];

  const collectFromAnswers = (answers: InterviewAnswer[] | undefined) => {
    if (!answers?.length) return;
    for (const answer of answers) {
      allAnswers.push(answer);
      if (answer.childs?.length) {
        collectFromAnswers(answer.childs);
      }
    }
  };

  const walkSection = (section: InterviewSection) => {
    collectFromAnswers(section.answers);
    for (const question of section.questions ?? []) {
      collectFromAnswers(question.answers);
    }
  };

  for (const child of childSections) {
    walkSection(child);
  }

  return { parentSection, childSections, allAnswers };
};

export const buildSectionMap = (sections: InterviewSection[] = []): Map<number, SectionMeta> => {
  const map = new Map<number, SectionMeta>();

  const walk = (list: InterviewSection[]) => {
    for (const section of list) {
      map.set(section.sectionId, {
        sectionId: section.sectionId,
        sectionName: section.sectionName,
        sectionParentId: section.sectionParentId,
      });
      if (section.childs?.length) {
        walk(section.childs);
      }
    }
  };

  walk(sections);
  return map;
};

export const getRootSection = (
  sectionId: number,
  map: Map<number, SectionMeta>
): SectionMeta | null => {
  let current = map.get(sectionId);
  if (!current) return null;

  while (current.sectionParentId != null) {
    const parent = map.get(current.sectionParentId);
    if (!parent) break;
    current = parent;
  }

  return current;
};

export const formatAnswerDisplayValue = (answer: InterviewAnswer): string => {
  if (answer.allowText && answer.textValue?.trim()) {
    return answer.textValue.trim();
  }
  if (answer.allowRating && answer.ratingValue != null) {
    return String(answer.ratingValue);
  }
  if (answer.allowCheck) {
    return answer.checkValue ? 'Có' : 'Không';
  }
  if (answer.allowSelect) {
    return answer.checkValue || answer.selectValue ? 'Đã chọn' : 'Chưa chọn';
  }
  return '—';
};

export const hasAnswerData = (answer: InterviewAnswer): boolean => {
  if (answer.allowText && answer.textValue?.trim()) return true;
  if (answer.allowCheck && answer.checkValue) return true;
  if (answer.allowSelect && (answer.checkValue || answer.selectValue)) return true;
  if (answer.allowRating && answer.ratingValue != null) return true;
  return false;
};

export const extractAnswersWithData = (
  sections: InterviewSection[] = []
): FlatAnswerRow[] => {
  const sectionMap = buildSectionMap(sections);
  const rows: FlatAnswerRow[] = [];

  const pushAnswer = (
    answer: InterviewAnswer,
    section: InterviewSection,
    source: string,
    question: InterviewQuestion | null
  ) => {
    if (!hasAnswerData(answer)) return;

    const root = getRootSection(section.sectionId, sectionMap);
    const parentMeta =
      section.sectionParentId != null
        ? sectionMap.get(section.sectionParentId)
        : null;

    rows.push({
      rootSectionId: root?.sectionId ?? section.sectionId,
      rootSectionName: root?.sectionName ?? section.sectionName,
      parentSectionId: section.sectionParentId,
      parentSectionName: parentMeta?.sectionName ?? null,
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      questionId: question?.questionId ?? answer.questionId ?? null,
      questionName: question?.questionName ?? null,
      answerId: answer.answerId,
      answerName: answer.answerName,
      source,
      displayValue: formatAnswerDisplayValue(answer),
      raw: answer,
    });
  };

  const walkAnswers = (
    answers: InterviewAnswer[] | undefined,
    section: InterviewSection,
    source: string,
    question: InterviewQuestion | null
  ) => {
    if (!answers?.length) return;

    for (const answer of answers) {
      pushAnswer(answer, section, source, question);
      if (answer.childs?.length) {
        walkAnswers(answer.childs, section, `${source} > answer.childs`, question);
      }
    }
  };

  const walkSection = (section: InterviewSection) => {
    walkAnswers(section.answers, section, 'section.answers', null);

    for (const question of section.questions ?? []) {
      walkAnswers(
        question.answers,
        section,
        'section.questions[].answers',
        question
      );
    }

    for (const child of section.childs ?? []) {
      walkSection(child);
    }
  };

  for (const section of sections) {
    walkSection(section);
  }

  return rows;
};

export const logInterviewDetailAnswers = (
  data: { sections?: InterviewSection[] } | null | undefined
) => {
  const sections = data?.sections ?? [];
  const flatAnswers = extractAnswersWithData(sections);

  return flatAnswers;
};
