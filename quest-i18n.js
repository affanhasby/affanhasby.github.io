/* AFFAN QUEST, i18n strings */
window.QuestI18n = {
  current: 'en',
  setLang(l) { this.current = l; },
  t(key) {
    const dict = this[this.current] || this.id;
    return key.split('.').reduce((o, k) => (o ? o[k] : undefined), dict) || key;
  },

  id: {
    title: { name: 'A Journey in Pixels', subtitle: 'Explore. Talk. Discover.',
      badge: 'PETUALANGAN INTERAKTIF',
      desc: 'Jelajahi peta karir Affan Hasby. Ngobrol dengan rekan kerja, tangkap bug, kumpulkan fakta tersembunyi di sepanjang jalan.',
      start: 'MULAI PETUALANGAN', howto: 'CARA BERMAIN', version: 'v1.0',
      legend_move: 'Gerak: WASD / Arrow / Joystick',
      legend_talk: 'Tekan E untuk berinteraksi',
      legend_quest: 'Selesaikan 5 misi yang ada',
      splash: ['Tangkap bugnya!', 'Gotta catch ’em all!', 'Built with ❤️', 'Yuk main!'] },
    hud: { zone: 'AREA', title: 'AFFAN QUEST' },
    controls: { move: 'gerak', talk: 'interaksi', close: 'tutup' },
    quests: { title: 'Misi',
      q1: 'Berkenalan dengan Head of QA Stockbit',
      q2: 'Kunjungi 3 gedung experience',
      q3: 'Tangkap bug yang berkeliaran',
      q4: 'Baca papan petunjuk di tengah taman',
      q5: 'Temukan portal kembali ke menu',
      q6: 'Kumpulkan 3 fakta di sepanjang jalan' },
    hints: {
      label: 'PETUNJUK',
      q1: 'Pergi ke gedung <b>Stockbit</b>, temui Head of QA di sebelahnya.',
      q2: 'Kunjungi gedung experience lain dan ngobrol dengan orang di depannya.',
      q3: 'Cari bug merah yang berkeliaran, dekati lalu tekan E.',
      q4: 'Baca <b>papan petunjuk kayu</b> di tengah taman.',
      q5: 'Cari <b>portal bercahaya hijau</b> di pojok kiri-bawah peta.',
      q6: 'Kumpulkan <b>orb kuning</b> di sepanjang jalan, jalan saja mendekatinya.'
    },
    dialog: { continue: 'lanjut', talk: 'Bicara', read: 'Baca', catch: 'Tangkap', enter: 'Masuk' },
    facts: {
      f1: { label: 'TAHUKAH KAMU?', text: 'Affan berasal dari <b>Boyolali, Jawa Tengah</b>.' },
      f2: { label: 'FAKTA', text: 'Sudah <b>6+ tahun</b> berkecimpung di industri teknologi.' },
      f3: { label: 'KARIR', text: 'Pernah jadi <b>Frontend Dev, PM</b>, dan <b>QA</b>.' },
      f4: { label: 'PERJALANAN', text: 'Pernah pivot dari <b>Frontend Dev → Project Manager → QA</b>. Setiap perpindahan bawa mindset baru.' },
      f5: { label: 'EFISIENSI', text: 'Berhasil <b>mengurangi waktu testing</b> sambil tetap meningkatkan kualitas produk lewat optimasi workflow.' },
      f6: { label: 'PRESTASI', text: 'Pioneer <b>GRPC automation testing</b> di Stockbit.' },
      f7: { label: 'SIDE PROJECT', text: 'Pernah grow Instagram Roma Malkist dari <b>100 ke 10,000 followers</b>.' },
      f8: { label: 'MENGAJAR', text: 'Membimbing <b>50+ mahasiswa</b> dengan <b>100% pass rate</b>.' },
      f9: { label: 'RISET', text: 'Penelitian akademiknya membandingkan kualitas <b>WebRTC vs SIP</b> menggunakan metric PSNR.' }
    },
    npcs: {
      'stockbit-lead': { name: 'Head of QA', role: 'Stockbit',
        intro: 'Halo! Ini kantor <b>Stockbit</b>. Saya Head of QA, atasan Affan.',
        choicePrompt: 'Mau tau lebih soal Affan di sini lewat <b>mini-game</b> (tangkap bug!) atau langsung saya jelaskan?',
        choiceGame: '🐛 Main mini-game',
        choiceDirect: '💬 Langsung jelaskan',
        facts: [
          'Affan adalah <b>Senior QA</b> kami sejak Februari 2025, naik dari QA Tester.',
          "Pencapaian: automation coverage <span class='accent'>90%+</span>, defect containment <span class='accent'>90%+</span>, dan <b>mengurangi waktu testing</b> serta <b>meningkatkan kualitas produk</b> lewat optimasi workflow.",
          'Mindset-nya bukan cuma cari bug, tapi <b>mencegah bug terjadi sejak awal</b>.'
        ],
        outroWin: 'Mantap! Kamu udah selangkah lebih dekat kenal Affan. 🎉',
        outroSkip: '',
        d: [
          'Halo! Ini kantor <b>Stockbit</b>. Saya Head of QA, atasan Affan.',
          'Affan adalah <b>Senior QA</b> kami sejak Februari 2025, naik dari QA Tester.',
          "Pencapaian: automation coverage <span class='accent'>90%+</span>, defect containment <span class='accent'>90%+</span>, dan <b>mengurangi waktu testing</b> serta <b>meningkatkan kualitas produk</b> lewat optimasi workflow.",
          'Mindset-nya bukan cuma cari bug, tapi <b>mencegah bug terjadi sejak awal</b>.'
        ] },
      'telkom-prof': { name: 'Pak Dosen', role: 'Universitas Telkom',
        d: [
          'Selamat datang di <b>Universitas Telkom</b>. Saya dosen pembimbing Affan.',
          'Affan menyelesaikan S1 <b>Informatika</b> di sini (2017–2021), sekarang sedang menempuh <b>MBA</b> (2023–2026).',
          "Selama kuliah, dia menjadi <b>Lab Assistant</b> dua semester, membimbing <b>50+ mahasiswa</b> dengan <span class='accent'>100% pass rate</span>.",
          'Publikasinya: penelitian tentang <i>quality comparison WebRTC vs SIP</i> dengan PSNR.'
        ] },
      'telkom-id-mgr': { name: 'Manager', role: 'Telkom Indonesia',
        d: [
          'Ini gedung <b>Telkom Indonesia</b>. Affan magang di sini sebagai <b>Frontend Web Developer</b> (Aug 2020 – Jan 2021).',
          'Dia berhasil men-deliver dua produk: <b>VirtualPBX</b> dan <b>OASISLAB</b>, semua requirement terpenuhi tepat waktu.',
          'Konsep <b>logo OASISLAB</b> yang dipakai itu idenya Affan. Dia kombinasi tech & creative.'
        ] },
      'kb-pm': { name: 'Project Lead', role: 'Bank KB Bukopin',
        d: [
          'Halo, ini <b>Bank KB Bukopin</b>. Affan adalah <b>IT Project Manager</b> kami (Nov 2021 – Mar 2022).',
          "Dia mengelola proyek dengan <span class='accent'>85%</span> proses on-schedule, scope creep dipangkas <span class='accent'>20%</span>.",
          'Dari sini dia pivot ke QA, tapi mindset PM-nya tetap kebawa.'
        ] },
      'media-creative': { name: 'Creative Director', role: 'MEDIARūMU',
        d: [
          'Halo! Ini <b>MEDIARūMU</b>, agensi kreatif. Affan jadi <b>Project Manager</b> di sini (Mar – Aug 2020).',
          "Project terbaiknya: rebranding social media <b>Roma Malkist</b>. Followers dari <span class='accent'>100 ke 10,000</span>, pertumbuhan 100×.",
          "Timeline adherence <span class='accent'>85%+</span> dari plan awal."
        ] },
      'bug': { name: '???', role: 'Production Bug',
        d: [
          'Sssshhh... saya <b>production bug</b>. Saya sembunyi di antara fitur, suka muncul saat user lagi penting-pentingnya.',
          "Tapi Affan? Dia <b>jago banget nangkep saya di staging</b>. Jarang banget ada bug yang lolos sampai dipake user beneran.",
          '...okelah, saya akui. Respect untuk dia.'
        ] }
    },
    info: {
      label: '▸ Papan Petunjuk Taman',
      summary: 'Senior Software Quality Assurance yang sebelumnya pernah berkarier sebagai <b style="color:var(--text)">Frontend Developer</b>, <b style="color:var(--text)">Project Manager</b>, dan <b style="color:var(--text)">Product Manager</b>. Kombinasi pengalaman ini membentuk cara pandang holistik terhadap kualitas produk.',
      stats: { containment: 'Defect Containment', coverage: 'Automation Coverage', savings: 'Annual Savings', years: 'Years in Tech' },
      contact: { email: 'Email', linkedin: 'LinkedIn', origin: 'Asal', edu: 'Pendidikan' },
      contactBtn: 'HUBUNGI AFFAN'
    },
    portal: { msg: 'Portal kembali ke menu utama', press: 'untuk masuk' },
    howto: {
      title: 'Cara Bermain',
      controls: 'KONTROL',
      tips: 'TIPS',
      move: 'Gerak karakter dengan <b>WASD</b> atau <b>Arrow keys</b>.<br/>Mobile: pakai <b>joystick</b> di pojok kiri-bawah.',
      talk: 'Tekan <b>E</b> untuk berinteraksi dengan NPC, papan, atau objek.<br/>Mobile: tombol <b>E</b> di pojok kanan-bawah.',
      quest: 'Selesaikan 5 misi tersembunyi sambil eksplorasi peta.',
      tip1: 'Ngobrol dengan setiap NPC untuk tau cerita karir Affan.',
      tip2: 'Kumpulkan <b>orb kuning</b> di sepanjang jalan untuk fakta tersembunyi.',
      tip3: 'Tangkap bug merah yang berkeliaran sebelum mereka lolos.',
      tip4: 'Baca papan petunjuk di tengah taman untuk profil lengkap.',
      cta: 'Mulai Petualangan'
    },
    minigame: {
      title: '🐛 BUG HUNT',
      subtitle: 'Tangkap bug sebelum lolos ke production!',
      caught: 'Tangkap',
      lives: 'Nyawa',
      hint: 'Tap untuk tembak bug',
      production: 'PRODUCTION',
      bugCaught: 'BUG TERTANGKAP',
      continueBtn: 'Lanjut →',
      winTitle: 'Semua Bug Tertangkap!',
      winText: 'Kamu udah tau semua hal penting tentang Affan di Stockbit.',
      winBtn: 'Selesai',
      loseTitle: 'Game Over',
      loseText: 'Ada beberapa bug yang lolos. Mau coba lagi atau dengar sisanya langsung?',
      retryBtn: 'Coba lagi',
      skipBtn: 'Skip, dengar sisanya'
    }
  },

  en: {
    title: { name: 'A Journey in Pixels', subtitle: 'Explore. Talk. Discover.',
      badge: 'INTERACTIVE ADVENTURE',
      desc: 'Explore Affan Hasby\'s career map. Talk to colleagues, catch bugs, and collect hidden facts along the path.',
      start: 'START ADVENTURE', howto: 'HOW TO PLAY', version: 'v1.0',
      legend_move: 'Move: WASD / Arrows / Joystick',
      legend_talk: 'Press E to interact',
      legend_quest: 'Complete 5 quests',
      splash: ['Catch them all!', 'Gotta catch ’em all!', 'Built with ❤️', "Let's play!"] },
    hud: { zone: 'ZONE', title: 'AFFAN QUEST' },
    controls: { move: 'move', talk: 'interact', close: 'close' },
    quests: { title: 'Quests',
      q1: 'Meet the Stockbit Head of QA',
      q2: 'Visit 3 experience buildings',
      q3: 'Catch a wandering bug',
      q4: 'Read the signpost in the park center',
      q5: 'Find the portal back to the menu',
      q6: 'Collect 3 facts along the path' },
    hints: {
      label: 'HINT',
      q1: 'Head to the <b>Stockbit</b> building and talk to the Head of QA beside it.',
      q2: 'Visit other experience buildings and talk to the people standing next to them.',
      q3: 'Find the wandering red bug, approach it and press E.',
      q4: 'Read the <b>wooden signpost</b> in the park center.',
      q5: 'Look for the <b>glowing green portal</b> in the bottom-left of the map.',
      q6: 'Collect <b>yellow orbs</b> along the path, just walk near them.'
    },
    dialog: { continue: 'continue', talk: 'Talk', read: 'Read', catch: 'Catch', enter: 'Enter' },
    facts: {
      f1: { label: 'DID YOU KNOW?', text: 'Affan is from <b>Boyolali, Central Java</b>.' },
      f2: { label: 'FACT', text: 'Over <b>6 years</b> in the tech industry.' },
      f3: { label: 'CAREER', text: 'Has been a <b>Frontend Dev, PM</b>, and <b>QA</b>.' },
      f4: { label: 'JOURNEY', text: 'Pivoted from <b>Frontend Dev → Project Manager → QA</b>. Each shift brought a new mindset.' },
      f5: { label: 'EFFICIENCY', text: 'Successfully <b>reduced testing time</b> while still improving product quality through workflow optimization.' },
      f6: { label: 'ACHIEVEMENT', text: 'Pioneered <b>GRPC automation testing</b> at Stockbit.' },
      f7: { label: 'SIDE PROJECT', text: 'Grew Roma Malkist Instagram from <b>100 to 10,000 followers</b>.' },
      f8: { label: 'MENTORING', text: 'Mentored <b>50+ students</b> with <b>100% pass rate</b>.' },
      f9: { label: 'RESEARCH', text: 'His academic research compared <b>WebRTC vs SIP</b> quality using the PSNR metric.' }
    },
    npcs: {
      'stockbit-lead': { name: 'Head of QA', role: 'Stockbit',
        intro: "Hey! This is <b>Stockbit</b>'s office. I'm the Head of QA, Affan's manager.",
        choicePrompt: 'Wanna learn about Affan via a <b>mini-game</b> (catch bugs!) or just have me explain it?',
        choiceGame: '🐛 Play mini-game',
        choiceDirect: '💬 Just explain',
        facts: [
          "Affan is our <b>Senior QA</b> since February 2025, promoted from QA Tester.",
          "Achievements: automation coverage <span class='accent'>90%+</span>, defect containment <span class='accent'>90%+</span>, and <b>reduced testing time</b> while <b>improving product quality</b> through workflow optimization.",
          "His mindset isn't just about catching bugs, it's about <b>preventing them from happening in the first place</b>."
        ],
        outroWin: "Nice! You're one step closer to knowing Affan. 🎉",
        outroSkip: '',
        d: [
          "Hey! This is <b>Stockbit</b>'s office. I'm the Head of QA, Affan's manager.",
          "Affan is our <b>Senior QA</b> since February 2025, promoted from QA Tester.",
          "Achievements: automation coverage <span class='accent'>90%+</span>, defect containment <span class='accent'>90%+</span>, and <b>reduced testing time</b> while <b>improving product quality</b> through workflow optimization.",
          "His mindset isn't just about catching bugs, it's about <b>preventing them from happening in the first place</b>."
        ] },
      'telkom-prof': { name: 'Professor', role: 'Telkom University',
        d: [
          "Welcome to <b>Telkom University</b>. I'm Affan's academic advisor.",
          "Affan completed his <b>Bachelor's in Informatics</b> here (2017–2021), and is now pursuing his <b>MBA</b> (2023–2026).",
          "During his studies, he was a <b>Lab Assistant</b> for two semesters, mentoring <b>50+ students</b> with <span class='accent'>100% pass rate</span>.",
          "His publication: research on <i>quality comparison of WebRTC vs SIP</i> using PSNR."
        ] },
      'telkom-id-mgr': { name: 'Manager', role: 'Telkom Indonesia',
        d: [
          "This is the <b>Telkom Indonesia</b> building. Affan interned here as <b>Frontend Web Developer</b> (Aug 2020 – Jan 2021).",
          "He delivered two products: <b>VirtualPBX</b> and <b>OASISLAB</b>, all requirements met on time.",
          "The <b>OASISLAB logo</b> concept they used? His idea. Tech & creative combo."
        ] },
      'kb-pm': { name: 'Project Lead', role: 'Bank KB Bukopin',
        d: [
          "Hi, this is <b>Bank KB Bukopin</b>. Affan was our <b>IT Project Manager</b> (Nov 2021 – Mar 2022).",
          "He managed projects with <span class='accent'>85%</span> on-schedule delivery, scope creep cut by <span class='accent'>20%</span>.",
          "From here he pivoted to QA, but the PM mindset stayed."
        ] },
      'media-creative': { name: 'Creative Director', role: 'MEDIARūMU',
        d: [
          "Hi! This is <b>MEDIARūMU</b>, a creative agency. Affan was <b>Project Manager</b> here (Mar – Aug 2020).",
          "Best project: rebranding <b>Roma Malkist</b> social media. Followers grew from <span class='accent'>100 to 10,000</span>, 100× growth.",
          "Timeline adherence <span class='accent'>85%+</span> from initial plan."
        ] },
      'bug': { name: '???', role: 'Production Bug',
        d: [
          "Sssshhh... I'm a <b>production bug</b>. I hide between features, love to surface when users need things most.",
          "But Affan? He's <b>really good at catching me in staging</b>. Bugs rarely slip through to actual users.",
          "...okay, I respect him."
        ] }
    },
    info: {
      label: '▸ Park Signpost',
      summary: 'A Senior Software Quality Assurance who previously worked as a <b style="color:var(--text)">Frontend Developer</b>, <b style="color:var(--text)">Project Manager</b>, and <b style="color:var(--text)">Product Manager</b>. This blend of experience shapes a holistic perspective on product quality.',
      stats: { containment: 'Defect Containment', coverage: 'Automation Coverage', savings: 'Annual Savings', years: 'Years in Tech' },
      contact: { email: 'Email', linkedin: 'LinkedIn', origin: 'From', edu: 'Education' },
      contactBtn: 'CONTACT AFFAN'
    },
    portal: { msg: 'Portal back to main menu', press: 'to enter' },
    howto: {
      title: 'How to Play',
      controls: 'CONTROLS',
      tips: 'TIPS',
      move: 'Move your character with <b>WASD</b> or <b>Arrow keys</b>.<br/>Mobile: use the <b>joystick</b> at the bottom-left.',
      talk: 'Press <b>E</b> to interact with NPCs, signs, or objects.<br/>Mobile: <b>E</b> button at the bottom-right.',
      quest: 'Complete 5 hidden quests while exploring the map.',
      tip1: 'Talk to every NPC to learn about Affan\'s career.',
      tip2: 'Collect <b>yellow orbs</b> along paths for hidden facts.',
      tip3: 'Catch the red wandering bugs before they escape.',
      tip4: 'Read the park signpost for the full profile.',
      cta: 'Start Adventure'
    },
    minigame: {
      title: '🐛 BUG HUNT',
      subtitle: 'Catch the bugs before they reach production!',
      caught: 'Caught',
      lives: 'Lives',
      hint: 'Tap to shoot the bugs',
      production: 'PRODUCTION',
      bugCaught: 'BUG CAUGHT',
      continueBtn: 'Continue →',
      winTitle: 'All Bugs Caught!',
      winText: 'You now know everything important about Affan at Stockbit.',
      winBtn: 'Done',
      loseTitle: 'Game Over',
      loseText: 'Some bugs slipped through. Want to retry or hear the rest directly?',
      retryBtn: 'Retry',
      skipBtn: 'Skip, just tell me'
    }
  }
};
