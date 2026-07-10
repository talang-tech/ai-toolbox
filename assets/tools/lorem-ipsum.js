// Lorem Ipsum Generator - Classic Latin placeholder text generator
(() => {
  const typeSelect = document.getElementById('li-type');
  const countInput = document.getElementById('li-count');
  const output = document.getElementById('li-output');
  const genBtn = document.getElementById('li-gen');
  const copyBtn = document.getElementById('li-copy');
  const formatSelect = document.getElementById('li-format');
  const isEN = document.documentElement.lang === 'en';

  // Classic Lorem Ipsum text
  const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
    'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
    'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
    'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
    'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
    'est', 'laborum', 'fusce', 'dapibus', 'tellus', 'ac', 'cursus', 'commodo',
    'tortor', 'mauris', 'condimentum', 'nibh', 'ut', 'fermentum', 'massa', 'justo',
    'sit', 'amet', 'risus', 'nullam', 'dictum', 'felis', 'eu', 'pede', 'mollis',
    'pretium', 'integer', 'tincidunt', 'cras', 'dapibus', 'vivamus', 'elementum',
    'semper', 'nisi', 'aenean', 'vulputate', 'eleifend', 'tellus', 'auctor', 'turpis',
    'phasellus', 'ultrices', 'nulla', 'tempus', 'imperdiet', 'donec', 'ultricies',
    'ornare', 'lectus', 'bibendum', 'suspendisse', 'potenti', 'vivamus', 'magna',
    'justo', 'lacinia', 'eget', 'consectetur', 'sed', 'convallis', 'at', 'tellu',
    'proin', 'quam', 'etiam', 'tempor', 'orci', 'dapibus', 'facilisis', 'ornare',
    'pretium', 'maecenas', 'accumsan', 'lacus', 'vel', 'facilisis', 'volutpat',
    'est', 'velit', 'egestas', 'dui', 'id', 'ornare', 'arcu', 'odio', 'ut', 'sem',
    'quam', 'viverra', 'orci', 'sagittis', 'eu', 'volutpat', 'odio', 'facilisis',
    'mauris', 'augue', 'neque', 'gravida', 'in', 'fermentum', 'et', 'sollicitudin',
    'ac', 'orci', 'phasellus', 'egestas', 'tellus', 'rutrum', 'tellus', 'pellentesque',
    'eu', 'tincidunt', 'tortor', 'aliquam', 'nulla', 'facilisi', 'cras', 'fermentum',
    'odio', 'eu', 'feugiat', 'pretium', 'nibh', 'ipsum', 'consequat', 'nisl',
    'vel', 'pretium', 'lectus', 'quam', 'id', 'leo', 'in', 'vitae', 'turpis',
    'massa', 'sed', 'elementum', 'tempus', 'egestas', 'sed', 'sed', 'risus',
    'pretium', 'quam', 'vulputate', 'dignissim', 'suspendisse', 'in', 'est',
    'ante', 'in', 'nibh', 'mauris', 'cursus', 'mattis', 'molestie', 'a', 'iaculis',
    'at', 'erat', 'pellentesque', 'adipiscing', 'commodo', 'elit', 'at', 'imperdiet',
    'dui', 'accumsan', 'sit', 'amet', 'nulla', 'facilisi', 'morbi', 'tempus',
    'iaculis', 'urna', 'id', 'volutpat', 'lacus', 'laoreet', 'non', 'curabitur',
    'gravida', 'arcu', 'ac', 'tortor', 'dignissim', 'convallis', 'aenean', 'et',
    'tortor', 'at', 'risus', 'viverra', 'adipiscing', 'at', 'in', 'tellus'
  ];

  // Cicero paragraph starters
  const PARAGRAPH_STARTERS = [
    'Lorem ipsum dolor sit amet',
    'Sed ut perspiciatis unde omnis iste natus error',
    'At vero eos et accusamus et iusto odio dignissimos',
    'Nam libero tempore cum soluta nobis est eligendi',
    'Neque porro quisquam est qui dolorem ipsum quia',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    'Maecenas tempus tellus eget condimentum rhoncus',
    'Pellentesque habitant morbi tristique senectus et netus',
    'Curabitur blandit tempus porttitor',
    'Nullam quis risus eget urna mollis ornare vel eu leo',
    'Donec id elit non mi porta gravida at eget metus',
    'Fusce dapibus tellus ac cursus commodo tortor mauris',
    'Etiam porta sem malesuada magna mollis euismod',
    'Cras mattis consectetur purus sit amet fermentum',
    'Aenean lacinia bibendum nulla sed consectetur'
  ];

  function makeSentence(words, minWords, maxWords) {
    minWords = minWords || 5;
    maxWords = maxWords || 12;
    const len = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
    let sentence = '';
    for (let i = 0; i < len; i++) {
      const word = words[Math.floor(Math.random() * words.length)];
      if (i === 0) {
        sentence += word.charAt(0).toUpperCase() + word.slice(1);
      } else {
        sentence += ' ' + word;
      }
    }
    return sentence + '.';
  }

  function makeParagraph(words, minSentences, maxSentences) {
    minSentences = minSentences || 3;
    maxSentences = maxSentences || 7;
    const count = minSentences + Math.floor(Math.random() * (maxSentences - minSentences + 1));
    let para = '';
    for (let i = 0; i < count; i++) {
      para += (i === 0 ? '' : ' ') + makeSentence(words);
    }
    return para;
  }

  function generateWords(words, count) {
    // Start with a known starter for recognizability
    const starter = PARAGRAPH_STARTERS[Math.floor(Math.random() * PARAGRAPH_STARTERS.length)];
    const starterWords = starter.split(' ');
    if (count <= starterWords.length) {
      return starterWords.slice(0, count).join(' ') + '.';
    }
    let result = starter;
    let remaining = count - starterWords.length;
    for (let i = 0; i < remaining; i++) {
      result += ' ' + words[Math.floor(Math.random() * words.length)];
    }
    // Capitalize first word if starter doesn't start with Lorem
    return result.charAt(0).toUpperCase() + result.slice(1) + '.';
  }

  function generate() {
    const type = typeSelect.value;
    const count = Math.max(1, Math.min(10000, parseInt(countInput.value) || 100));
    const format = formatSelect.value;
    let result = '';

    switch (type) {
      case 'words':
        result = generateWords(LOREM_WORDS, count);
        break;
      case 'sentences': {
        const sCount = Math.min(count, 200);
        for (let i = 0; i < sCount; i++) {
          result += (i > 0 ? ' ' : '') + makeSentence(LOREM_WORDS);
        }
        break;
      }
      case 'paragraphs': {
        const pCount = Math.min(count, 50);
        const paras = [];
        for (let i = 0; i < pCount; i++) {
          paras.push(makeParagraph(LOREM_WORDS));
        }
        if (format === 'html') {
          result = paras.map(p => '<p>' + p + '</p>').join('\n');
        } else {
          result = paras.join('\n\n');
        }
        return output.value = result;
      }
      case 'list': {
        const lCount = Math.min(count, 100);
        for (let i = 0; i < lCount; i++) {
          const words = i === 0 ? 'Lorem ipsum dolor sit amet' : makeSentence(LOREM_WORDS, 3, 8);
          if (format === 'html') {
            result += '<li>' + words + '</li>\n';
          } else {
            result += '- ' + words + '\n';
          }
        }
        if (format === 'html') result = '<ul>\n' + result + '</ul>';
        return output.value = result;
      }
    }

    // Apply format for words/sentences
    if (format === 'html' && type === 'sentences') {
      result = '<p>' + result + '</p>';
    }

    output.value = result;
  }

  function copy() {
    output.select();
    navigator.clipboard.writeText(output.value).then(() => {
      const el = document.createElement('div');
      el.className = 'toast show';
      el.textContent = isEN ? 'Copied!' : '已复制!';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1800);
    });
  }

  genBtn.addEventListener('click', generate);
  copyBtn.addEventListener('click', copy);
  generate();
})();