// Chinese Lorem Ipsum Generator
(() => {
  const countInput = document.getElementById('loremCount');
  const typeSelect = document.getElementById('loremType');
  const output = document.getElementById('loremOutput');
  const genBtn = document.getElementById('loremGen');
  const copyBtn = document.getElementById('loremCopy');
  const isEN = document.documentElement.lang === 'en';

  // 不同风格的中文语料
  const corpora = {
    classic: [
      '道可道非常道名可名非常名无名天地之始有名万物之母',
      '北冥有鱼其名为鲲鲲之大不知其几千里也化而为鸟其名为鹏',
      '学而时习之不亦说乎有朋自远方来不亦乐乎人不知而不愠不亦君子乎',
      '大学之道在明明德在亲民在止于至善知止而后有定定而后能静静而后能安安而后能虑虑而后能得',
      '关关雎鸠在河之洲窈窕淑女君子好逑参差荇菜左右流之窈窕淑女寤寐求之',
      '上善若水水善利万物而不争处众人之所恶故几于道',
      '昔者庄周梦为胡蝶栩栩然胡蝶也自喻适志与不知周也俄然觉则蘧蘧然周也不知周之梦为胡蝶与胡蝶之梦为周与',
    ],
    news: [
      '新华社北京消息国家发展改革委今日发布通知要求各地各部门切实做好民生保障工作',
      '记者从交通运输部获悉今年全国铁路营业里程已突破十五万公里其中高铁超过三万八千公里',
      '商务部新闻发言人在例行发布会上表示中方一贯反对单边主义和贸易保护主义',
      '据气象部门预计未来三天我国中东部地区将出现大范围雨雪天气局部地区有大到暴雪',
      '教育部近日印发通知要求进一步减轻义务教育阶段学生作业负担和校外培训负担',
    ],
    essay: [
      '我这时很兴奋但不知道怎么说才好只是说阿闰土哥你来了我接着便有许多话想要连珠一般涌出角鸡跳鱼儿贝壳猹但又总觉得被什么挡着似的单在脑里面回旋吐不出口外去',
      '盼望着盼望着东风来了春天的脚步近了一切都像刚睡醒的样子欣欣然张开了眼山朗润起来了水涨起来了太阳的脸红起来了',
      '曲曲折折的荷塘上面弥望的是田田的叶子叶子出水很高像亭亭的舞女的裙层层的叶子中间零星地点缀着些白花有袅娜地开着的有羞涩地打着朵儿的',
      '燕子去了有再来的时候杨柳枯了有再青的时候桃花谢了有再开的时候但是聪明的你告诉我我们的日子为什么一去不复返呢',
    ],
    tech: [
      '人工智能大模型通过海量数据训练能够执行自然语言理解图像识别代码生成等复杂任务',
      '微服务架构将单体应用拆分为多个独立服务每个服务运行在自己的进程中通过轻量级通信机制互相配合',
      '容器技术使得应用程序及其依赖环境打包成标准单元实现开发测试生产环境的一致性',
      '云原生计算基金会推动云原生技术普及包括容器微服务服务网格声明式API等关键技术',
      '分布式系统通过网络连接多台计算机协同工作共同完成大规模计算和存储任务',
    ]
  };

  function generate(type, count) {
    const corpus = corpora[type] || corpora.classic;
    let result = [];
    let remaining = count;
    
    while (remaining > 0) {
      const text = corpus[Math.floor(Math.random() * corpus.length);
      if (text.length <= remaining) {
        result.push(text);
        remaining -= text.length;
      } else {
        result.push(text.slice(0, remaining));
        remaining = 0;
      }
    }
    
    // 按 100 字左右换行
    let output = result.join('');
    let formatted = '';
    for (let i = 0; i < output.length; i += 100) {
      formatted += output.slice(i, i + 100) + '\n\n';
    }
    return formatted.trim();
  }

  function gen() {
    const type = typeSelect.value;
    const count = Math.max(10, Math.min(10000, parseInt(countInput.value) || 500));
    output.value = generate(type, count);
    showToast(isEN ? 'Generated!' : '已生成!');
  }

  genBtn.addEventListener('click', gen);
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
    showToast(isEN ? 'Copied!' : '已复制!');
  });

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }
})();
