// Single avatar set: popular anime characters. Portraits come from the AniList
// CDN (stable image URLs). An avatar value is the character's id; everything
// else (image, display name) is resolved from the list below.

export interface AnimeCharacter {
  id: string;
  name: string;
  img: string;
}

export const ANIME_CHARACTERS: AnimeCharacter[] = [
  { id: "levi", name: "Levi", img: "https://s4.anilist.co/file/anilistcdn/character/large/b45627-CR68RyZmddGG.png" },
  { id: "satoru-gojou", name: "Satoru Gojo", img: "https://s4.anilist.co/file/anilistcdn/character/large/b127691-9zqh1xpIubn7.png" },
  { id: "killua-zoldyck", name: "Killua Zoldyck", img: "https://s4.anilist.co/file/anilistcdn/character/large/b27-Z5O02kQUydpT.jpg" },
  { id: "luffy-monkey", name: "Monkey D. Luffy", img: "https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png" },
  { id: "eren-yeager", name: "Eren Yeager", img: "https://s4.anilist.co/file/anilistcdn/character/large/b40882-dsj7IP943WFF.jpg" },
  { id: "zoro-roronoa", name: "Roronoa Zoro", img: "https://s4.anilist.co/file/anilistcdn/character/large/b62-S7oAeA9WInjV.png" },
  { id: "emilia", name: "Emilia", img: "https://s4.anilist.co/file/anilistcdn/character/large/b88572-IzTwXEHSobRs.jpg" },
  { id: "lelouch-lamperouge", name: "Lelouch Lamperouge", img: "https://s4.anilist.co/file/anilistcdn/character/large/b417-gVLmIJu9phcK.png" },
  { id: "l-lawliet", name: "L Lawliet", img: "https://s4.anilist.co/file/anilistcdn/character/large/b71-1W4panC53vfs.png" },
  { id: "mikasa-ackerman", name: "Mikasa Ackerman", img: "https://s4.anilist.co/file/anilistcdn/character/large/b40881-F3gr1PkreDvj.png" },
  { id: "ken-kaneki", name: "Ken Kaneki", img: "https://s4.anilist.co/file/anilistcdn/character/large/b87275-mb13EWZBdbh3.png" },
  { id: "arataka-reigen", name: "Arataka Reigen", img: "https://s4.anilist.co/file/anilistcdn/character/large/b89334-OPj1hCzvrt7X.png" },
  { id: "guts", name: "Guts", img: "https://s4.anilist.co/file/anilistcdn/character/large/b422-XTaiTuvRohsV.png" },
  { id: "kurisu-makise", name: "Kurisu Makise", img: "https://s4.anilist.co/file/anilistcdn/character/large/b34470-Jw2LXZBL5R8i.png" },
  { id: "itachi-uchiha", name: "Itachi Uchiha", img: "https://s4.anilist.co/file/anilistcdn/character/large/b14-9Kb1E5oel1ke.png" },
  { id: "makima", name: "Makima", img: "https://s4.anilist.co/file/anilistcdn/character/large/b137080-UHcynYNjb5ZU.png" },
  { id: "mai-sakurajima", name: "Mai Sakurajima", img: "https://s4.anilist.co/file/anilistcdn/character/large/b127222-Jh5hhP7vZ7s1.png" },
  { id: "kakashi-hatake", name: "Kakashi Hatake", img: "https://s4.anilist.co/file/anilistcdn/character/large/b85-mkVBh2yjxjmx.png" },
  { id: "thorfinn-karlsefni", name: "Thorfinn", img: "https://s4.anilist.co/file/anilistcdn/character/large/b10138-zOPrka0ddZOR.png" },
  { id: "yuuji-itadori", name: "Yuji Itadori", img: "https://s4.anilist.co/file/anilistcdn/character/large/b127212-FVm2tD0erQ5B.png" },
  { id: "frieren", name: "Frieren", img: "https://s4.anilist.co/file/anilistcdn/character/large/b176754-PCnpqIOkjhFk.png" },
  { id: "rintarou-okabe", name: "Rintaro Okabe", img: "https://s4.anilist.co/file/anilistcdn/character/large/b35252-DY9TW6pusqeh.png" },
  { id: "maomao", name: "Maomao", img: "https://s4.anilist.co/file/anilistcdn/character/large/b126824-MqsCncTO1qpv.png" },
  { id: "kaguya-shinomiya", name: "Kaguya Shinomiya", img: "https://s4.anilist.co/file/anilistcdn/character/large/b120649-NPaWaIpWy60E.png" },
  { id: "kurapika", name: "Kurapika", img: "https://s4.anilist.co/file/anilistcdn/character/large/b28-ivA7UGnfE40a.png" },
  { id: "light-yagami", name: "Light Yagami", img: "https://s4.anilist.co/file/anilistcdn/character/large/b80-26EhwSsSqQ50.png" },
  { id: "violet-evergarden", name: "Violet Evergarden", img: "https://s4.anilist.co/file/anilistcdn/character/large/b90169-4wr1Zehnsac8.png" },
  { id: "denji", name: "Denji", img: "https://s4.anilist.co/file/anilistcdn/character/large/b130102-FO1VHNnEnLlB.png" },
  { id: "power", name: "Power", img: "https://s4.anilist.co/file/anilistcdn/character/large/b137079-6yLEUYR3bmpr.png" },
  { id: "shigeo-kageyama", name: "Shigeo Kageyama", img: "https://s4.anilist.co/file/anilistcdn/character/large/b89616-dXmdOc7L6SDi.png" },
  // Dandadan
  { id: "okarun", name: "Okarun", img: "https://s4.anilist.co/file/anilistcdn/character/large/b222593-qBqUvpodooAI.png" },
  { id: "momo-ayase", name: "Momo Ayase", img: "https://s4.anilist.co/file/anilistcdn/character/large/b222594-24Jn7qlI5spH.png" },
  { id: "aira-shiratori", name: "Aira Shiratori", img: "https://s4.anilist.co/file/anilistcdn/character/large/b245466-rd5I5mchZ3bv.png" },
  { id: "turbo-babaa", name: "Turbo Babaa", img: "https://s4.anilist.co/file/anilistcdn/character/large/b239956-Fok0Pl3rNOEL.png" },
  { id: "seiko-ayase", name: "Seiko Ayase", img: "https://s4.anilist.co/file/anilistcdn/character/large/b234824-i3s64ueaBqGq.png" },
  // Gachiakuta
  { id: "rudo", name: "Rudo", img: "https://s4.anilist.co/file/anilistcdn/character/large/b266433-8JWks5k2OPJn.png" },
  { id: "enjin", name: "Enjin", img: "https://s4.anilist.co/file/anilistcdn/character/large/b266438-3Veykti1lXgg.png" },
  { id: "zanka-nijiku", name: "Zanka", img: "https://s4.anilist.co/file/anilistcdn/character/large/b268742-PSWLnWDJH7HJ.png" },
  { id: "chiwa", name: "Chiwa", img: "https://s4.anilist.co/file/anilistcdn/character/large/b266434-Wkjo1jlTgDCm.jpg" },
  // Spy x Family
  { id: "anya-forger", name: "Anya Forger", img: "https://s4.anilist.co/file/anilistcdn/character/large/b138100-4Li0tWRCa5bQ.png" },
  { id: "yor-forger", name: "Yor Forger", img: "https://s4.anilist.co/file/anilistcdn/character/large/b138102-ZOAu9jI2d5ke.png" },
  { id: "loid-forger", name: "Loid Forger", img: "https://s4.anilist.co/file/anilistcdn/character/large/b138101-7NCB0Md8zA6G.png" },
  // Plus de personnages populaires
  { id: "yoichi-isagi", name: "Yoichi Isagi", img: "https://s4.anilist.co/file/anilistcdn/character/large/b140856-wVzKSyvU7R5B.png" },
  { id: "gon-freecss", name: "Gon Freecss", img: "https://s4.anilist.co/file/anilistcdn/character/large/b30-lyFExKyDhefc.jpg" },
  { id: "hisoka-morow", name: "Hisoka", img: "https://s4.anilist.co/file/anilistcdn/character/large/b31-FZckOuu7L1un.png" },
  { id: "ryomen-sukuna", name: "Sukuna", img: "https://s4.anilist.co/file/anilistcdn/character/large/b133701-rCQuDpHr3UZL.png" },
  { id: "megumi-fushiguro", name: "Megumi Fushiguro", img: "https://s4.anilist.co/file/anilistcdn/character/large/b126635-L0y3I92JSUkN.png" },
  { id: "nobara-kugisaki", name: "Nobara Kugisaki", img: "https://s4.anilist.co/file/anilistcdn/character/large/b133700-f6sOO3TcgLV6.png" },
  { id: "tanjiro-kamado", name: "Tanjiro Kamado", img: "https://s4.anilist.co/file/anilistcdn/character/large/b126071-BTNEc1nRIv68.png" },
  { id: "nezuko-kamado", name: "Nezuko Kamado", img: "https://s4.anilist.co/file/anilistcdn/character/large/b127518-NRlq1CQ1v1ro.png" },
  { id: "zenitsu-agatsuma", name: "Zenitsu", img: "https://s4.anilist.co/file/anilistcdn/character/large/b129131-FZrQ7lSlxmEr.png" },
  { id: "saitama", name: "Saitama", img: "https://s4.anilist.co/file/anilistcdn/character/large/b73935-ON5d0mAcrItd.jpg" },
  { id: "son-goku", name: "Son Goku", img: "https://s4.anilist.co/file/anilistcdn/character/large/246-wsRRr6z1kii8.png" },
  { id: "vegeta", name: "Vegeta", img: "https://s4.anilist.co/file/anilistcdn/character/large/b913-NIFkKazWM8VO.png" },
  { id: "naruto-uzumaki", name: "Naruto Uzumaki", img: "https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png" },
  { id: "sasuke-uchiha", name: "Sasuke Uchiha", img: "https://s4.anilist.co/file/anilistcdn/character/large/b13-SISLEw1oAD7a.png" },
  { id: "asta", name: "Asta", img: "https://s4.anilist.co/file/anilistcdn/character/large/b123285-tKijiuQErDS0.png" },
  { id: "kobeni-higashiyama", name: "Kobeni", img: "https://s4.anilist.co/file/anilistcdn/character/large/b144594-0dbO1NSYeZ12.png" },
];

const BY_ID = new Map(ANIME_CHARACTERS.map((c) => [c.id, c]));

export const DEFAULT_AVATAR = ANIME_CHARACTERS[0].id;

export function avatarUrl(value: string): string {
  return (BY_ID.get(value) || ANIME_CHARACTERS[0]).img;
}

export function avatarName(value: string): string {
  return (BY_ID.get(value) || ANIME_CHARACTERS[0]).name;
}
