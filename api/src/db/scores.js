import mongoose from "mongoose";

import { processImportAsync } from "../utils.js";
import { divIdToShort } from "../dataUtil/divisions.js";
import { curHHFForDivisionClassifier } from "../dataUtil/hhf.js";
import { N, Percent, PositiveOrMinus1 } from "../dataUtil/numbers.js";

const ScoreSchema = new mongoose.Schema(
  {
    classifier: String,
    sd: Date,
    clubid: String,
    club_name: String,
    percent: Number,
    hf: Number,
    recHHF: Number,
    code: { type: String, maxLength: 1 },
    source: String,
    memberNumber: String,
    division: String,
  },
  { strict: false }
);
ScoreSchema.virtual("isMajor").get(function () {
  return this.source === "Major Match";
});
ScoreSchema.virtual("curPercent").get(function () {
  return this.isMajor
    ? this.percent
    : PositiveOrMinus1(Percent(this.hf, this.hhf));
});
ScoreSchema.virtual("recPercent").get(function () {
  return this.isMajor
    ? this.percent
    : PositiveOrMinus1(Percent(this.hf, this.recHHF));
});
// TODO: get rid of percentMinusCurPercent
ScoreSchema.virtual("percentMinusCurPercent").get(function () {
  return this.curPercent >= 0 ? N(this.percent - this.curPercent) : -1;
});

ScoreSchema.index({ classifier: 1, division: 1 });
ScoreSchema.index({ memberNumber: 1 });

export const Score = mongoose.model("Score", ScoreSchema);

const classifierScoreId = (memberId, obj) => {
  return [memberId, obj.classifier, obj.sd, obj.clubid, obj.hf].join("=");
};

const badScoresMap = {
  "125282=23-01=2/18/24=CCS08=15.9574": "CCB-shooter-158-percent",
};

export const hydrateScores = async () => {
  console.log("hydrating initial scores");
  console.time("scores");
  await Score.deleteMany({});
  await processImportAsync(
    "../../data/imported",
    /classifiers\.\d+\.json/,
    async (obj) => {
      const memberNumber = obj?.value?.member_data?.member_number;
      const memberId = obj?.value?.member_data?.member_id;
      const classifiers = obj?.value?.classifiers;
      return Promise.all(
        classifiers.map((divObj) => {
          const divShort = divIdToShort[divObj?.division_id];
          if (!divShort) {
            // new imports have some weird division numbers (1, 10, etc) no idea what that is
            // just skip for now
            return null;
          }

          const curFileScores = divObj.division_classifiers
            .filter(({ source }) => source !== "Legacy") // saves RAM, no point looking at old
            .filter((obj) => !badScoresMap[classifierScoreId(memberId, obj)]) // ignore banned scores
            .map(
              ({
                code,
                source,
                hf: hfRaw,
                percent: percentString,
                sd,
                clubid,
                club_name,
                classifier,
              }) => {
                const isMajor = source === "Major Match";
                const hhf = isMajor
                  ? -1
                  : curHHFForDivisionClassifier({
                      division: divShort,
                      number: classifier,
                    });
                const percent = Number(percentString);
                const hf = Number(hfRaw);

                return {
                  classifier,
                  sd,
                  clubid,
                  club_name,
                  percent,
                  hf: !isNaN(hf) ? hf : undefined,
                  hhf,
                  code,
                  source,
                  memberNumber,
                  division: divShort,

                  // set in second step in hydrareRecHHF()
                  // recHHF: getRecHHFMap()[division]?.[number] || 0;
                };
              }
            );

          process.stdout.write(".");
          return Score.insertMany(curFileScores);
        })
      );
    }
  );
  console.timeEnd("scores");
};
