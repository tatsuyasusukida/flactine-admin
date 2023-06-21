import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.courseCategory.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      sort: 1,
      name: "定期配達コース",
    },
  });

  await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      sort: 1,
      name: "花の宅配専門店ピュアフラワー　季節の花束　定期配達コース",
      price: "１回のお届け、１束あたり９９０円",
      term: "基本２週間に１回\n※夏期（８月）と年末年始（１２月下旬～１月上旬）にお休み期間があります。",
      imageUrl: "/img/course-01.jpg",
      imageWidth: 1000,
      imageHeight: 750,
      stripePriceId: process.env.STRIPE_PRICE_ID!,
      courseCategoryId: 1,
    },
  });

  const aichi = await prisma.prefecture.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      sort: 1,
      name: "愛知県",
    },
  });

  const gifu = await prisma.prefecture.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      sort: 2,
      name: "岐阜県",
    },
  });

  const mie = await prisma.prefecture.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      sort: 3,
      name: "三重県",
    },
  });

  const aichiCities =
    "名古屋市・一宮市・岩倉市・江南市・小牧市・犬山市・扶桑町・大口町・春日井市・北名古屋市・清須市・瀬戸市・稲沢市・あま市・愛西市・弥富市・大治町・蟹江町・豊山町・知立市・刈谷市・大府市・東浦町・日進市・豊明市・尾張旭市・みよし市・長久手町・東郷町・東海市・知多市・安城市・高浜市・碧南市・西尾市・常滑市・半田市・武豊町・阿久比町・豊田市・岡崎市・幸田町・豊橋市・豊川市・蒲郡市".split(
      "・"
    );

  const gifuCities =
    "岐阜市・大垣市・瑞穂市・本巣市・関市・各務原市・多治見市・笠松町・岐南町・神戸町".split(
      "・"
    );

  const mieCities = "四日市市・鈴鹿市・桑名市・朝日町・川越町・東員町".split(
    "・"
  );

  let id = 1;

  for (const name of aichiCities) {
    await prisma.city.upsert({
      where: { id },
      update: {},
      create: {
        id,
        sort: id,
        name,
        prefectureId: aichi.id,
      },
    });

    id += 1;
  }

  for (const name of gifuCities) {
    await prisma.city.upsert({
      where: { id },
      update: {},
      create: {
        id,
        sort: id,
        name,
        prefectureId: gifu.id,
      },
    });

    id += 1;
  }

  for (const name of mieCities) {
    await prisma.city.upsert({
      where: { id },
      update: {},
      create: {
        id,
        sort: id,
        name,
        prefectureId: mie.id,
      },
    });

    id += 1;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
