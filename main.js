
(function () {
  'use strict';

  /* ---------- Atalho para querySelector ---------- */
  var $ = function (seletor) { return document.querySelector(seletor); };

  var botaoMenu = $('#botao-menu');
  var menu = $('#menu');

  function alternarMenu(abrir) {
    var vaiAbrir = typeof abrir === 'boolean' ? abrir : !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', vaiAbrir);
    botaoMenu.setAttribute('aria-expanded', String(vaiAbrir));
  }

  botaoMenu.addEventListener('click', function () { alternarMenu(); });

  /* Fecha o menu ao clicar em qualquer link dentro dele */
  menu.addEventListener('click', function (evento) {
    if (evento.target.classList.contains('navegacao__link') ||
        evento.target.classList.contains('navegacao__botao-cta')) {
      alternarMenu(false);
    }
  });

  /* Fecha o menu com a tecla Escape  */
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && menu.classList.contains('aberto')) {
      alternarMenu(false);
      botaoMenu.focus();
    }
  });

  /*  ANO AUTOMÁTICO NO RODAPÉ
     */
  $('#ano-atual').textContent = new Date().getFullYear();

  var secoes = document.querySelectorAll('.secao, .hero__conteudo');

  if ('IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          observador.unobserve(entrada.target); 
        }
      });
    }, { threshold: 0.12 });

    secoes.forEach(function (secao) {
      secao.classList.add('revelar');
      observador.observe(secao);
    });
  }

 
  var links = menu.querySelectorAll('.navegacao__link');
  var ids = Array.prototype.map.call(links, function (link) {
    return link.getAttribute('href').slice(1); // remove o "#"
  });
  var alvos = ids.map(function (id) { return document.getElementById(id); });

  function marcarLinkAtivo() {
    var posicao = window.scrollY + 120;
    var atual = ids[0];
    alvos.forEach(function (alvo, i) {
      if (alvo && alvo.offsetTop <= posicao) atual = ids[i];
    });
    links.forEach(function (link) {
      link.classList.toggle('ativo', link.getAttribute('href') === '#' + atual);
    });
  }

  window.addEventListener('scroll', marcarLinkAtivo, { passive: true });
  marcarLinkAtivo();

  
  var formulario = $('#form-contato');
  var status = $('#form-status');

  function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var nome = formulario.nome.value.trim();
    var email = formulario.email.value.trim();
    var assunto = formulario.assunto.value;
    var mensagem = formulario.mensagem.value.trim();

    /* Marca campos inválidos e cancela o envio */
    formulario.nome.classList.toggle('invalido', !nome);
    formulario.email.classList.toggle('invalido', !emailValido(email));
    formulario.assunto.classList.toggle('invalido', !assunto);
    formulario.mensagem.classList.toggle('invalido', !mensagem);

    if (!nome || !emailValido(email) || !assunto || !mensagem) {
      status.textContent = 'Verifique os campos destacados e tente novamente.';
      return;
    }

    /* Guarda localmente (demo)  */
    try {
      var caixa = JSON.parse(localStorage.getItem('mensagens_contato')) || [];
      caixa.push({ nome: nome, email: email, assunto: assunto, mensagem: mensagem, data: new Date().toISOString() });
      localStorage.setItem('mensagens_contato', JSON.stringify(caixa));
      status.textContent = 'Mensagem enviada! Retorno em até 24 horas úteis.';
      mostrarToast('Mensagem enviada com sucesso!');
      formulario.reset();
    } catch (erro) {
      status.textContent = 'Não foi possível enviar agora. Tente por e-mail direto.';
      mostrarToast('Não foi possível enviar agora.');
    }
  });

  ['nome', 'email', 'assunto', 'mensagem'].forEach(function (campo) {
    formulario[campo].addEventListener(campo === 'assunto' ? 'change' : 'input', function () {
      this.classList.remove('invalido');
    });
  });

  /* =====================================================
     6. TEMA CLARO/ESCURO
     ===================================================== */
  var raizHtml = document.documentElement;
  var botaoTema = $('#botao-tema');
  var CHAVE_TEMA = 'portfolio_tema';

  function aplicarTema(tema) {
    raizHtml.setAttribute('data-tema', tema);
    botaoTema.setAttribute('aria-pressed', String(tema === 'escuro'));
    botaoTema.setAttribute('aria-label', tema === 'escuro' ? 'Alternar para tema claro' : 'Alternar para tema escuro');
  }

  var temaSalvo = null;
  try { temaSalvo = localStorage.getItem(CHAVE_TEMA); } catch (erro) { temaSalvo = null; }

  if (temaSalvo) {
    aplicarTema(temaSalvo);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    aplicarTema('escuro');
  } else {
    aplicarTema('claro');
  }

  botaoTema.addEventListener('click', function () {
    var novoTema = raizHtml.getAttribute('data-tema') === 'escuro' ? 'claro' : 'escuro';
    aplicarTema(novoTema);
    try { localStorage.setItem(CHAVE_TEMA, novoTema); } catch (erro) { /* modo privado: ignora */ }
  });

  
  var numeros = document.querySelectorAll('[data-contar]');

  function animarNumero(elemento) {
    var alvo = parseInt(elemento.getAttribute('data-contar'), 10);
    var sufixo = elemento.getAttribute('data-sufixo') || '';
    var duracao = 1200;
    var inicio = null;

    function passo(timestamp) {
      if (!inicio) inicio = timestamp;
      var progresso = Math.min((timestamp - inicio) / duracao, 1);
      var valorAtual = Math.floor(progresso * alvo);
      elemento.textContent = valorAtual + sufixo;
      if (progresso < 1) window.requestAnimationFrame(passo);
      else elemento.textContent = alvo + sufixo;
    }
    window.requestAnimationFrame(passo);
  }

  if ('IntersectionObserver' in window && numeros.length) {
    var observadorNumeros = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          animarNumero(entrada.target);
          observadorNumeros.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.5 });
    numeros.forEach(function (numero) { observadorNumeros.observe(numero); });
  } else {
    numeros.forEach(function (numero) {
      numero.textContent = numero.getAttribute('data-contar') + (numero.getAttribute('data-sufixo') || '');
    });
  }

  
  var botaoTopo = $('#botao-topo');
  window.addEventListener('scroll', function () {
    var mostrar = window.scrollY > 480;
    botaoTopo.hidden = false; /* mantém no DOM para a transição funcionar */
    botaoTopo.classList.toggle('visivel', mostrar);
  }, { passive: true });

  botaoTopo.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

 
  var toast = $('#toast');
  var temporizadorToast = null;

  function mostrarToast(mensagem) {
    toast.textContent = mensagem;
    toast.hidden = false;
    /* pequeno atraso para o navegador aplicar a transição */
    window.requestAnimationFrame(function () { toast.classList.add('visivel'); });

    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(function () {
      toast.classList.remove('visivel');
      setTimeout(function () { toast.hidden = true; }, 300);
    }, 3200);
  }

  
  document.querySelectorAll('.faq__pergunta').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var expandido = botao.getAttribute('aria-expanded') === 'true';
      var resposta = document.getElementById(botao.getAttribute('aria-controls'));
      botao.setAttribute('aria-expanded', String(!expandido));
      resposta.hidden = expandido;
    });
  });

  
  var pontosLaterais = document.querySelectorAll('.ancoras-laterais__ponto');
  if (pontosLaterais.length) {
    function marcarPontoAtivo() {
      var posicao = window.scrollY + 160;
      var atual = ids[0];
      alvos.forEach(function (alvo, i) {
        if (alvo && alvo.offsetTop <= posicao) atual = ids[i];
      });
      pontosLaterais.forEach(function (ponto) {
        ponto.classList.toggle('ativo', ponto.getAttribute('data-secao') === atual);
      });
    }
    window.addEventListener('scroll', marcarPontoAtivo, { passive: true });
    marcarPontoAtivo();
  }

 
  var botaoBaixarCv = $('#botao-baixar-cv');
  if (botaoBaixarCv) {
    botaoBaixarCv.addEventListener('click', function () {
      var janela = window.open('cv.html', '_blank');
      if (janela) {
        janela.addEventListener('load', function () {
          janela.focus();
          janela.print();
        });
      }
    });
  }

 
  setTimeout(function () {
    document.querySelectorAll('.revelar:not(.visivel)').forEach(function (el) {
      el.classList.add('visivel');
    });
  }, 2500);
})();
