\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{ittelkom_ppi}
\LoadClass[a4]{article}
\RequirePackage{titlesec}
\RequirePackage{graphicx}
\RequirePackage{setspace}
%\usepackage[USenglish]{babel}
%\usepackage[nodayofweek,level]{datetime}
\renewcommand{\contentsname}{DAFTAR ISI}

\titleformat{\section}
  {\Large\sffamily\raggedright}
  {\thesection}
  {1em}
  {}
  [\titlerule]
  
  \titleformat{\subsection}
  {\large\sffamily\raggedright}
  {\thesubsection}
  {1em}
  {}

\def\flushboth{%
  \let\\\@normalcr
  \@rightskip\z@skip \rightskip\@rightskip
  \leftskip\z@skip
  \parindent 1.5em\relax}

\setlength{\parfillskip}{0pt plus 1fil}
  
\newcommand{\laporancapstonecover}[8]{
	\clearpage
	\thispagestyle{empty}
    \begin{center}
      {\huge\sffamily\bfseries
      \setlength{\baselineskip}{0.9\baselineskip}
      Laporan Proyek pada Industri\\[-0.5em]
      #3\par}
      \vspace{1cm}
      \includegraphics[width=0.4\textwidth]{logotelu}
    \end{center}
      \Large
      \centering \textbf{Oleh}\par
      \large
      { \begin{spacing}{1}
        Nama : \textbf{#4} \\
        NIM : \textbf{#5} \\
        Pembimbing Akademik : \textbf{#6} \\
        Pembimbing Lapangan : \textbf{#7} \\
        Perusahaan / Organisasi : \textbf{#8} \\
        {#1} {#2}
        \end{spacing}
      }    
      \vspace{3.25cm}
        
      \Large
       \begin{spacing}{1}
      \textbf{PROGRAM STUDI S2 ILMU FORENSIK\\[0.3em]
      FAKULTAS INFORMATIKA\\[0.3em]
      UNIVERSITAS TELKOM}\\
      {#2}
      \end{spacing}\par
      
      \newpage
      
      \begin{center}
      {\huge\sffamily\bfseries
      \setlength{\baselineskip}{0.9\baselineskip}
      HALAMAN PENGESAHAN\\[-0.5em]
      Laporan Proyek pada Industri\\[-0.5em]
      #3\par}
      \vspace{1cm}
      \Large
      \centering \textbf{Oleh}\par
      \large
      { \begin{spacing}{1}
        Nama : \textbf{#4} \\
        NIM : \textbf{#5} \\
        \end{spacing}
        \vspace{3cm}
        Bandung, {#1} {#2} \\
        Menyetujui,
      }    
    \end{center}
	\begin{table}[h]
	\centering
\begin{tabular}{lll}
                                                                                        & \multicolumn{1}{c}{Mahasiswa} &                                                                                         \\
                                                                                        &                               &                                                                                         \\
                                                                                        &                               &                                                                                         \\
                                                                                        
                                                                                                                                                                                &                               &                                                                                         \\
                                                                                        & \multicolumn{1}{c}{({#4})}     &                                                                                         \\
                                                                                        &                               &                                                                                         \\                                                                                       
                                                                                        &                               &                                                                                         \\
\multicolumn{1}{c}{\begin{tabular}[c]{@{}c@{}}Dosen Pembimbing\\ Akademik\end{tabular}} &                               & \multicolumn{1}{c}{\begin{tabular}[c]{@{}c@{}}Dosen Pembimbing\\ Lapangan\end{tabular}} \\
                                                                                        &                               &                                                                                         \\
                                                                                                                                                                              &                               &                                                                                         \\                                                                                        
                                                                                        &                               &                                                                                         \\
\multicolumn{1}{c}{({#6})}                                                               &                               & \multicolumn{1}{c}{({#7})}                                                              
\end{tabular}
\end{table}


}

\newcommand{\proposalcapstonecover}[8]{
	\clearpage
	\thispagestyle{empty}
    \begin{center}
      {\huge\sffamily\bfseries
      \fontsize{20}{22}\selectfont
      Proposal Proyek pada Industri\\[-0.3em]
      #3\par}
      \vspace{1cm}
      \includegraphics[width=0.4\textwidth]{logotelu}
    \end{center}
      \Large
      \centering \textbf{Oleh}\par
      \large
      { \begin{spacing}{1}
        Nama : \textbf{#4} \\
        NIM : \textbf{#5} \\
        Pembimbing Akademik : \textbf{#6} \\
        Pembimbing Lapangan : \textbf{#7} \\
        Perusahaan / Organisasi : \textbf{#8} \\
        {#1} {#2}
        \end{spacing}
      }    
      \vspace{3.25cm}
        
      \Large
       \begin{spacing}{1}
      \textbf{PROGRAM STUDI S2 ILMU FORENSIK\\[0.3em]
      FAKULTAS INFORMATIKA\\[0.3em]
      UNIVERSITAS TELKOM}\\
      {#2}
      \end{spacing}\par
      
      \newpage
      
      \begin{center}
      {\huge\sffamily\bfseries
      \fontsize{20}{22}\selectfont
      HALAMAN PENGESAHAN\\[-0.3em]
      Proposal Proyek pada Industri\\[-0.3em]
      #3\par}
      \vspace{1cm}
      \Large
      \centering \textbf{Oleh}\par
      \large
      { \begin{spacing}{1}
        Nama : \textbf{#4} \\
        NIM : \textbf{#5} \\
        \end{spacing}
        \vspace{3cm}
        Bandung, {#1} {#2} \\
        Menyetujui,
      }    
    \end{center}
	\begin{table}[h]
	\centering
\begin{tabular}{lll}
                                                                                        & \multicolumn{1}{c}{Mahasiswa} &                                                                                         \\
                                                                                        &                               &                                                                                         \\
                                                                                        &                               &                                                                                         \\
                                                                                        
                                                                                                                                                                                &                               &                                                                                         \\
                                                                                        & \multicolumn{1}{c}{({#4})}     &                                                                                         \\
                                                                                        &                               &                                                                                         \\                                                                                       
                                                                                        &                               &                                                                                         \\
\multicolumn{1}{c}{\begin{tabular}[c]{@{}c@{}}Dosen Pembimbing\\ Akademik\end{tabular}} &                               & \multicolumn{1}{c}{\begin{tabular}[c]{@{}c@{}}Dosen Pembimbing\\ Lapangan\end{tabular}} \\
                                                                                        &                               &                                                                                         \\
                                                                                                                                                                              &                               &                                                                                         \\                                                                                        
                                                                                        &                               &                                                                                         \\
\multicolumn{1}{c}{({#6})}                                                               &                               & \multicolumn{1}{c}{({#7})}                                                              
\end{tabular}
\end{table}


      

}



\linespread{2}
\newcommand{\project}[1]{
  \raggedright{\LARGE\bfseries\sffamily Judul Capstone: {#1}
\rule{\linewidth}{.2pt}
}
}
\newcommand{\submit}[1]{
  \raggedright{\large\scshape Nama : {#1}\par}
}
\newcommand{\nim}[1]{
  \raggedright{\large\scshape NIM : {#1}\par}
}

\newcommand{\email}[1]{
  \raggedright{\large\scshape{E-mail :} \textsf{{#1}}\par}
}
\newcommand{\supervisor}[2]{
  \raggedright{\large\scshape Pembimbing Akademik : {#1}}\par
  \raggedright{\large\scshape Pembimbing Lapangan : {#2}}\par
}
\newcommand{\submitdate}[3]{
  \raggedright{\large\scshape Tanggal : {#1} \\ Fakultas informatika}\par
}








\newcommand{\supervisorcomments}{
\section*{Supervisor (I)'s Comments:}
\fbox {
    \parbox{\linewidth}{\textbf{Comments about the title}
    \vspace*{3cm}
    }
}
\fbox {
    \parbox{\linewidth}{\textbf{Comments about the research method}
    \vspace*{7cm}
    }
}
\fbox {
    \parbox{\linewidth}{\textbf{Sign \hfill Date:\hspace*{3cm}\\[1.25cm]}
    (\underline{\hspace*{5cm}})
    }
}

\section*{Supervisor (II)'s Comments:}
\fbox {
    \parbox{\linewidth}{\textbf{Comments about the title}
    \vspace*{3cm}
    }
}
\fbox {
    \parbox{\linewidth}{\textbf{Comments about the research method}
    \vspace*{7cm}
    }
}
\fbox {
    \parbox{\linewidth}{\textbf{Sign \hfill Date:\hspace*{3cm}\\[1.25cm]}
    (\underline{\hspace*{5cm}})
    }
}
}
\newcommand{\contact}[5]{
    #1 {\large\textperiodcentered} #2 {\large\textperiodcentered} #3
    {\Large} #4 \ {\Large} #5}