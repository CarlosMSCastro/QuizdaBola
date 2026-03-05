const service = require("./stats-quiz.service");

exports.getStatsQuestion = async (req, res) => {
  try {
    const { exclude, competition_id } = req.query;
    const competitionId = competition_id || "ligaportugal2024";

    // Procurar competição
    const tableName = await service.getActiveCompetition(competitionId);
    const BIG_TEAMS = service.getBigTeams(competitionId);
    const minReqs = service.getMinRequirements(competitionId);

    // Preparar exclusões
    const excludeIds = exclude
      ? exclude.split(",").map(Number).filter(Boolean)
      : [];
    const excludeList =
      excludeIds.length > 0 ? `AND id NOT IN (${excludeIds.join(",")})` : "";

    // Determinar formato e dificuldade
    const format = service.determineFormat();
    const difficulty = service.determineDifficulty();

    // Escolher stat
    let { stat, config } = service.randomStat();
    const minimum = config.minimums[stat];
    const positions = config.positions;
    let statColumn = stat;

    const bigTeamsOrder =
      BIG_TEAMS.length > 0
        ? `CASE WHEN team_name IN (${BIG_TEAMS.map(() => "?").join(",")}) THEN 1 ELSE 2 END`
        : "1";

    if (format === "F2") {
      return await handleF2(
        res,
        tableName,
        stat,
        statColumn,
        minimum,
        positions,
        difficulty,
        excludeList,
        bigTeamsOrder,
        BIG_TEAMS,
        minReqs,
      );
    } else {
      return await handleF3(
        res,
        tableName,
        stat,
        statColumn,
        minimum,
        positions,
        difficulty,
        excludeList,
        BIG_TEAMS,
        minReqs,
        competitionId,
      );
    }
  } catch (error) {
    console.error("[ERRO STATS-QUIZ]", error);

    if (error.message === "Competição não encontrada") {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Erro ao gerar pergunta" });
  }
};

async function handleF2(
  res,
  tableName,
  stat,
  statColumn,
  minimum,
  positions,
  difficulty,
  excludeList,
  bigTeamsOrder,
  BIG_TEAMS,
  minReqs,
) {
  // Procurar pool
  let pool = await service.getF2PlayerPool(
    tableName,
    stat,
    statColumn,
    minimum,
    positions,
    difficulty,
    excludeList,
    bigTeamsOrder,
    BIG_TEAMS,
    minReqs,
  );

  if (pool.length < 2) {
    console.error(`[ERRO F2] Sem jogadores disponíveis para stat=${stat}`);
    return res.status(404).json({ error: "Sem jogadores disponíveis" });
  }

  // Encontrar par plausível
  let pair = service.findPlausiblePair(pool, stat);

  if (!pair) {
    console.error(`[ERRO F2] Sem par plausível disponível para stat=${stat}`);

    // se erro FALLBACK: tentar com age
    if (stat !== "age") {
      console.log("[FALLBACK FINAL] Tentando com stat=age...");
      const fallback = await service.fallbackToAge(
        tableName,
        excludeList,
        bigTeamsOrder,
        BIG_TEAMS,
        minReqs,
      );

      if (fallback) {
        pair = { player1: fallback.player1, player2: fallback.player2 };
        stat = fallback.stat;
        statColumn = fallback.stat;
      }
    }

    if (!pair) {
      return res.status(404).json({ error: "Sem par plausível disponível" });
    }
  }

  const { player1, player2 } = pair;
  const STAT_LABELS = service.getStatLabels();
  const label = STAT_LABELS[stat];
  const correctId =
    parseFloat(player1.stat_value) > parseFloat(player2.stat_value)
      ? player1.id
      : player2.id;

  const formatValue = (val) => service.formatStatValue(stat, val);

  const helpData = {
    type: "reveal",
    player1_id: player1.id,
    player1_value: formatValue(player1.stat_value),
    player2_id: player2.id,
    player2_value: formatValue(player2.stat_value),
  };

  return res.json({
    format: "F2",
    question_pt: label.question_pt,
    question_en: label.question_en,
    players: [
      {
        id: player1.id,
        name: player1.name,
        photo: player1.photo,
        team_logo: player1.team_logo,
        statValue: formatValue(player1.stat_value),
      },
      {
        id: player2.id,
        name: player2.name,
        photo: player2.photo,
        team_logo: player2.team_logo,
        statValue: formatValue(player2.stat_value),
      },
    ],
    stat,
    correctAnswer: correctId,
    helpData,
    options: null,
  });
}

async function handleF3(
  res,
  tableName,
  stat,
  statColumn,
  minimum,
  positions,
  difficulty,
  excludeList,
  BIG_TEAMS,
  minReqs,
  competitionId,
) {
  const useBigTeam = Math.random() < 0.75 && BIG_TEAMS.length > 0;
  const bigTeamFilter = useBigTeam
    ? `AND team_name IN (${BIG_TEAMS.map(() => "?").join(",")})`
    : "";
  const bigTeamParams = useBigTeam ? BIG_TEAMS : [];

  const F3_HELP_MAP = service.getF3HelpMap();
  const helpField = F3_HELP_MAP[stat].type;

  const player = await service.getF3Player(
    tableName,
    stat,
    statColumn,
    minimum,
    positions,
    difficulty,
    excludeList,
    bigTeamFilter,
    bigTeamParams,
    minReqs,
    helpField,
  );

  if (!player) {
    console.error(`[ERRO F3] Sem jogadores disponíveis para stat=${stat}`);
    return res.status(404).json({ error: "Sem jogadores disponíveis" });
  }

  const realValue = parseFloat(player.stat_value);
  const threshold = service.calculateF3Threshold(stat, realValue);
  const correctAnswer = realValue >= threshold;

  const STAT_LABELS = service.getStatLabels();
  const label = STAT_LABELS[stat];

  const helpData = {
    type: "hint",
    hint_type: helpField,
    hint_value: player[helpField],
  };

  const displayThreshold = stat === "rating" ? threshold.toFixed(2) : threshold;

  return res.json({
    format: "F3",
    question_pt: `${player.name} tem ${displayThreshold} ou mais ${label.pt}?`,
    question_en: `Does ${player.name} have ${displayThreshold} or more ${label.en}?`,
    players: [
      {
        id: player.id,
        name: player.name,
        photo: player.photo,
        team_logo: player.team_logo,
        statValue: service.formatStatValue(stat, player.stat_value),
      },
    ],
    stat,
    threshold: displayThreshold,
    correctAnswer,
    helpData,
    options: null,
  });
}
