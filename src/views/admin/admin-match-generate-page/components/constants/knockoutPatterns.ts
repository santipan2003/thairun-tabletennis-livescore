// knockoutPatterns.ts

// ฟังก์ชันสำหรับสุ่มตัวเลขในช่วงที่กำหนดโดยไม่ให้ซ้ำ
function getRandomUniqueNumbers(
  rangeStart: number,
  rangeEnd: number,
  count: number
): number[] {
  const numbers = Array.from(
    { length: rangeEnd - rangeStart + 1 },
    (_, i) => i + rangeStart
  );
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers.slice(0, count);
}

// ตัวเลขที่สุ่มสำหรับกลุ่มที่ต้องการ โดยสร้างรายการไม่ซ้ำกันสำหรับแต่ละช่วง
const groupMappings: { [key: string]: number[] } = {
  "3-4": getRandomUniqueNumbers(3, 4, 2),
  "5-8": getRandomUniqueNumbers(5, 8, 4),
  "9-13": getRandomUniqueNumbers(9, 13, 5),
  "9-16": getRandomUniqueNumbers(9, 16, 8),
  "1-16": getRandomUniqueNumbers(1, 16, 16),
  "17-28": getRandomUniqueNumbers(17, 28, 17),
  "17-30": getRandomUniqueNumbers(17, 30, 19),
  "17-32": getRandomUniqueNumbers(17, 32, 16),
  "1-4": getRandomUniqueNumbers(1, 4, 4),
  "1-8": getRandomUniqueNumbers(1, 8, 8),
};

interface Player {
  rank: number;
  group: string;
}

type Match = [Player, Player];

function generateKnockoutPattern(pattern: Match[]): Match[] {
  const groupCounts: { [key: string]: { rank1: number; rank2: number } } = {
    "3-4": { rank1: 0, rank2: 0 },
    "5-8": { rank1: 0, rank2: 0 },
    "9-13": { rank1: 0, rank2: 0 },
    "9-16": { rank1: 0, rank2: 0 },
    "1-16": { rank1: 0, rank2: 0 },
    "17-28": { rank1: 0, rank2: 0 },
    "17-30": { rank1: 0, rank2: 0 },
    "17-32": { rank1: 0, rank2: 0 },
    "1-4": { rank1: 0, rank2: 0 },
    "1-8": { rank1: 0, rank2: 0 },
  };

  console.log("Original pattern:", pattern);

  const newPattern = pattern.map(
    (match) =>
      match.map((player) => {
        // ตรวจสอบว่า rank 1 หรือ 2 และกลุ่มเป็นช่วงที่ต้องสุ่ม
        if (
          (player.rank === 1 || player.rank === 2) &&
          groupMappings[player.group]
        ) {
          const groupArray = groupMappings[player.group];
          const currentIndex = groupCounts[player.group][`rank${player.rank}`];

          // ตรวจสอบว่าค่าที่สุ่มมาในช่วงนั้นมีอยู่
          if (currentIndex < groupArray.length) {
            const randomGroup = groupArray[currentIndex];
            groupCounts[player.group][`rank${player.rank}`]++;
            return { ...player, group: randomGroup.toString() };
          }
        }
        return player;
      }) as Match
  );

  console.log("Generated pattern:", newPattern);
  return newPattern;
}

// ข้อมูล knockout pattern และกลุ่มที่ต้องการสุ่ม
const knockoutPatterns: { [key: number]: { [key: number]: Match[] } } = {
  64: {
    0: [
      // 1,2
      [
        { rank: 1, group: "1" },
        { rank: 2, group: "17-32" },
      ],
      // 3,4
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-32" },
      ],
      // 5,6
      [
        { rank: 1, group: "17-32" },
        { rank: 2, group: "1-16" },
      ],
      // 7,8
      [
        { rank: 2, group: "17-32" },
        { rank: 1, group: "9-16" },
      ],
      // 9,10
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-32" },
      ],
      // 11,12
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-32" },
      ],
      // 13,14
      [
        { rank: 1, group: "17-32" },
        { rank: 2, group: "1-16" },
      ],
      // 15,16
      [
        { rank: 2, group: "17-32" },
        { rank: 1, group: "5-8" },
      ],
      // 17,18
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "17-32" },
      ],
      // 19,20
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-32" },
      ],
      // 21,22
      [
        { rank: 1, group: "17-32" },
        { rank: 2, group: "1-16" },
      ],
      // 23,24
      [
        { rank: 2, group: "17-32" },
        { rank: 1, group: "9-16" },
      ],
      // 25,26
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-32" },
      ],
      // 27,28
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-32" },
      ],
      // 29,30
      [
        { rank: 1, group: "17-32" },
        { rank: 2, group: "1-16" },
      ],
      // 31,32
      [
        { rank: 2, group: "17-32" },
        { rank: 1, group: "3-4" },
      ],
      // 33,34
      [
        { rank: 1, group: "3-4" },
        { rank: 2, group: "17-32" },
      ],
      // 35,36
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-32" },
      ],
      // 37,38
      [
        { rank: 1, group: "17-32" },
        { rank: 2, group: "1-16" },
      ],
      // 39,40
      [
        { rank: 2, group: "17-32" },
        { rank: 1, group: "9-16" },
      ],
      // 41,42
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-32" },
      ],
      // 43,44
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-32" },
      ],
      // 45,46
      [
        { rank: 1, group: "17-32" },
        { rank: 2, group: "1-16" },
      ],
      // 47,48
      [
        { rank: 2, group: "17-32" },
        { rank: 1, group: "5-8" },
      ],
      // 49,50
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "17-32" },
      ],
      // 51,52
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-32" },
      ],
      // 53,54
      [
        { rank: 1, group: "17-32" },
        { rank: 2, group: "1-16" },
      ],
      // 55,56
      [
        { rank: 2, group: "17-32" },
        { rank: 1, group: "9-16" },
      ],
      // 57,58
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-32" },
      ],
      // 59,60
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-32" },
      ],
      // 61,62
      [
        { rank: 1, group: "17-32" },
        { rank: 2, group: "1-16" },
      ],
      // 63,64
      [
        { rank: 2, group: "17-32" },
        { rank: 1, group: "2" },
      ],
    ],
    4: [
      // 1,2
      [
        { rank: 1, group: "1" },
        { rank: 2, group: "BYE" },
      ],
      // 3,4
      [
        { rank: 2, group: "2" },
        { rank: 2, group: "17-30" },
      ],
      // 5,6
      [
        { rank: 1, group: "17-30" },
        { rank: 2, group: "1-16" },
      ],
      // 7,8
      [
        { rank: 2, group: "17-30" },
        { rank: 1, group: "9-16" },
      ],
      // 9,10
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-30" },
      ],
      // 11,12
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-30" },
      ],
      // 13,14
      [
        { rank: 1, group: "17-30" },
        { rank: 2, group: "1-16" },
      ],
      // 15,16
      [
        { rank: 2, group: "17-30" },
        { rank: 1, group: "5-8" },
      ],
      // 17,18
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "17-30" },
      ],
      // 19,20
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-30" },
      ],
      // 21,22
      [
        { rank: 1, group: "17-30" },
        { rank: 2, group: "1-16" },
      ],
      // 23,24
      [
        { rank: 2, group: "17-30" },
        { rank: 1, group: "9-16" },
      ],
      // 25,26
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-30" },
      ],
      // 27,28
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-30" },
      ],
      // 29,30
      [
        { rank: 1, group: "17-30" },
        { rank: 2, group: "1-16" },
      ],
      // 31,32
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "3-4" },
      ],
      // 33,34
      [
        { rank: 1, group: "3-4" },
        { rank: 2, group: "BYE" },
      ],
      // 35,36
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-30" },
      ],
      // 37,38
      [
        { rank: 1, group: "17-30" },
        { rank: 2, group: "1-16" },
      ],
      // 39,40
      [
        { rank: 2, group: "17-30" },
        { rank: 1, group: "9-16" },
      ],
      // 41,42
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-30" },
      ],
      // 43,44
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-30" },
      ],
      // 45,46
      [
        { rank: 1, group: "17-30" },
        { rank: 2, group: "1-16" },
      ],
      // 47,48
      [
        { rank: 2, group: "17-30" },
        { rank: 1, group: "5-8" },
      ],
      // 49,50
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "17-30" },
      ],
      // 51,52
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-30" },
      ],
      // 53,54
      [
        { rank: 1, group: "17-30" },
        { rank: 2, group: "1-16" },
      ],
      // 55,56
      [
        { rank: 2, group: "17-30" },
        { rank: 1, group: "9-16" },
      ],
      // 57,58
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-30" },
      ],
      // 59,60
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-30" },
      ],
      // 61,62
      [
        { rank: 2, group: "17-30" },
        { rank: 2, group: "1-16" },
      ],
      // 63,64
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "2" },
      ],
    ],
    8: [
      // 1,2
      [
        { rank: 1, group: "1" },
        { rank: 2, group: "BYE" },
      ],
      // 3,4
      [
        { rank: 2, group: "1-16" },
        { rank: 2, group: "17-28" },
      ],
      // 5,6
      [
        { rank: 1, group: "17-28" },
        { rank: 2, group: "1-16" },
      ],
      // 7,8
      [
        { rank: 2, group: "17-28" },
        { rank: 1, group: "9-16" },
      ],
      // 9,10
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-28" },
      ],
      // 11,12
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-28" },
      ],
      // 13,14
      [
        { rank: 1, group: "17-28" },
        { rank: 2, group: "1-16" },
      ],
      // 15,16
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "5-8" },
      ],
      // 17,18
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "BYE" },
      ],
      // 19,20
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-28" },
      ],
      // 21,22
      [
        { rank: 1, group: "17-28" },
        { rank: 2, group: "1-16" },
      ],
      // 23,24
      [
        { rank: 2, group: "17-28" },
        { rank: 1, group: "9-16" },
      ],
      // 25,26
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-28" },
      ],
      // 27,28
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-28" },
      ],
      // 29,30
      [
        { rank: 2, group: "17-28" },
        { rank: 2, group: "1-16" },
      ],
      // 31,32
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "3-4" },
      ],
      // 33,34
      [
        { rank: 1, group: "3-4" },
        { rank: 2, group: "BYE" },
      ],
      // 35,36
      [
        { rank: 2, group: "1-16" },
        { rank: 2, group: "17-28" },
      ],
      // 37,38
      [
        { rank: 1, group: "17-28" },
        { rank: 2, group: "1-16" },
      ],
      // 39,40
      [
        { rank: 2, group: "17-28" },
        { rank: 1, group: "9-16" },
      ],
      // 41,42
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-28" },
      ],
      // 43,44
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-28" },
      ],
      // 45,46
      [
        { rank: 1, group: "17-28" },
        { rank: 2, group: "1-16" },
      ],
      // 47,48
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "5-8" },
      ],
      // 49,50
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "BYE" },
      ],
      // 51,52
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-28" },
      ],
      // 53,54
      [
        { rank: 1, group: "17-28" },
        { rank: 2, group: "1-16" },
      ],
      // 55,56
      [
        { rank: 2, group: "17-28" },
        { rank: 1, group: "9-16" },
      ],
      // 57,58
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "17-28" },
      ],
      // 59,60
      [
        { rank: 2, group: "1-16" },
        { rank: 1, group: "17-28" },
      ],
      // 61,62
      [
        { rank: 2, group: "17-28" },
        { rank: 2, group: "1-16" },
      ],
      // 63,64
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "2" },
      ],
    ],
  },
  32: {
    0: [
      // 1,2
      [
        { rank: 1, group: "1" },
        { rank: 2, group: "9-16" },
      ],
      // 3,4
      [
        { rank: 2, group: "1-8" },
        { rank: 1, group: "9-16" },
      ],
      // 5,6
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "1-8" },
      ],
      // 7,8
      [
        { rank: 2, group: "9-16" },
        { rank: 1, group: "5-8" },
      ],
      // 9,10
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "9-16" },
      ],
      // 11,12
      [
        { rank: 2, group: "1-8" },
        { rank: 1, group: "9-16" },
      ],
      // 13,14
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "1-8" },
      ],
      // 15,16
      [
        { rank: 2, group: "9-16" },
        { rank: 1, group: "3-4" },
      ],
      // 17,18
      [
        { rank: 1, group: "3-4" },
        { rank: 2, group: "9-16" },
      ],
      // 19,20
      [
        { rank: 2, group: "1-8" },
        { rank: 1, group: "9-16" },
      ],
      // 21,22
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "1-8" },
      ],
      // 23,24
      [
        { rank: 2, group: "9-16" },
        { rank: 1, group: "5-8" },
      ],
      // 25,26
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "9-16" },
      ],
      // 27,28
      [
        { rank: 2, group: "1-8" },
        { rank: 1, group: "9-16" },
      ],
      // 29,30
      [
        { rank: 1, group: "9-16" },
        { rank: 2, group: "1-8" },
      ],
      // 31,32
      [
        { rank: 2, group: "9-16" },
        { rank: 1, group: "2" },
      ],
    ],
    6: [
      // 1,2
      [
        { rank: 1, group: "1" },
        { rank: 2, group: "BYE" },
      ],
      // 3,4
      [
        { rank: 2, group: "1-8" },
        { rank: 2, group: "9-13" },
      ],
      // 5,6
      [
        { rank: 1, group: "9-13" },
        { rank: 2, group: "1-8" },
      ],
      // 7,8
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "5-8" },
      ],
      // 9,10
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "9-13" },
      ],
      // 11,12
      [
        { rank: 2, group: "1-8" },
        { rank: 1, group: "9-13" },
      ],
      // 13,14
      [
        { rank: 2, group: "9-13" },
        { rank: 2, group: "1-8" },
      ],
      // 15,16
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "3-4" },
      ],
      // 17,18
      [
        { rank: 1, group: "3-4" },
        { rank: 2, group: "BYE" },
      ],
      // 19,20
      [
        { rank: 2, group: "1-8" },
        { rank: 1, group: "9-13" },
      ],
      // 21,22
      [
        { rank: 1, group: "9-13" },
        { rank: 2, group: "1-8" },
      ],
      // 23,24
      [
        { rank: 2, group: "9-13" },
        { rank: 1, group: "5-8" },
      ],
      // 25,26
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "BYE" },
      ],
      // 27,28
      [
        { rank: 2, group: "1-8" },
        { rank: 1, group: "9-13" },
      ],
      // 29,30
      [
        { rank: 2, group: "9-13" },
        { rank: 2, group: "1-8" },
      ],
      // 31,32
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "2" },
      ],
    ],
  },
  16: {
    0: [
      // 1,2
      [
        { rank: 1, group: "1" },
        { rank: 2, group: "5-8" },
      ],
      // 3,4
      [
        { rank: 2, group: "1-4" },
        { rank: 1, group: "5-8" },
      ],
      // 5,6
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "1-4" },
      ],
      // 7,8
      [
        { rank: 2, group: "5-8" },
        { rank: 1, group: "3-4" },
      ],
      // 9,10
      [
        { rank: 1, group: "3-4" },
        { rank: 2, group: "5-8" },
      ],
      // 11,12
      [
        { rank: 2, group: "1-4" },
        { rank: 1, group: "5-8" },
      ],
      // 13,14
      [
        { rank: 1, group: "5-8" },
        { rank: 2, group: "1-4" },
      ],
      // 15,16
      [
        { rank: 2, group: "5-8" },
        { rank: 1, group: "2" },
      ],
    ],
    4: [
      // 1,2
      [
        { rank: 1, group: "1" },
        { rank: 2, group: "BYE" },
      ],
      // 3,4
      [
        { rank: 2, group: "2" },
        { rank: 2, group: "3" },
      ],
      // 5,6
      [
        { rank: 1, group: "5" },
        { rank: 2, group: "6" },
      ],
      // 7,8
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "4" },
      ],
      // 9,10
      [
        { rank: 1, group: "3" },
        { rank: 2, group: "BYE" },
      ],
      // 11,12
      [
        { rank: 2, group: "4" },
        { rank: 1, group: "6" },
      ],
      // 13,14
      [
        { rank: 2, group: "5" },
        { rank: 2, group: "2" },
      ],
      // 15,16
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "2" },
      ],
    ],
  },
  8: {
    0: [
      // 1,2
      [
        { rank: 1, group: "1" },
        { rank: 2, group: "1-4" },
      ],
      // 3,4
      [
        { rank: 2, group: "1-4" },
        { rank: 2, group: "3-4" },
      ],
      // 5,6
      [
        { rank: 1, group: "3-4" },
        { rank: 2, group: "1-4" },
      ],
      // 7,8
      [
        { rank: 2, group: "1-4" },
        { rank: 1, group: "2" },
      ],
    ],
    2: [
      // 1,2
      [
        { rank: 1, group: "1" },
        { rank: 2, group: "BYE" },
      ],
      // 3,4
      [
        { rank: 2, group: "1-4" },
        { rank: 2, group: "3-4" },
      ],
      // 5,6
      [
        { rank: 1, group: "3-4" },
        { rank: 2, group: "1-4" },
      ],
      // 7,8
      [
        { rank: 2, group: "BYE" },
        { rank: 1, group: "2" },
      ],
    ],
  },
};

// Generate the randomized knockout pattern for all possible bye counts
const randomizedKnockoutPatterns = Object.keys(knockoutPatterns).reduce(
  (acc, key) => {
    const size = parseInt(key);
    acc[size] = Object.keys(knockoutPatterns[size]).reduce(
      (innerAcc, byeKey) => {
        const byeCount = parseInt(byeKey);
        innerAcc[byeCount] = generateKnockoutPattern(
          knockoutPatterns[size][byeCount]
        );
        return innerAcc;
      },
      {} as { [key: number]: Match[] }
    );
    return acc;
  },
  {} as { [key: number]: { [key: number]: Match[] } }
);

console.log("randomizedKnockoutPatterns", randomizedKnockoutPatterns);

// Export the randomized knockout patterns for use in other modules
export default randomizedKnockoutPatterns;
