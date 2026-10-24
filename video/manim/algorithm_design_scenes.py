"""Original Manim Community v0.18+ teaching scenes.
Manim rendering requires a local Manim+LaTeX installation and has NOT been run here.
Render, e.g.: manim -pql algorithm_design_scenes.py StableMatchingScene
"""
from manim import *

class StableMatchingScene(Scene):
    def construct(self):
        title = Text('Gale–Shapley: deferred acceptance', font_size=35).to_edge(UP)
        self.play(Write(title))
        left = VGroup(*[Circle(radius=.38,color=BLUE).add(Text(x,font_size=24)) for x in ['A','B','C']]).arrange(DOWN,buff=.8).shift(LEFT*3)
        right = VGroup(*[Circle(radius=.38,color=GREEN).add(Text(x,font_size=24)) for x in ['X','Y','Z']]).arrange(DOWN,buff=.8).shift(RIGHT*3)
        self.play(FadeIn(left),FadeIn(right))
        pairs=[(0,0),(1,1),(2,1),(1,0),(0,1),(0,2)]
        held={};lines={}
        for i,(a,b) in enumerate(pairs):
            who=Text(f'Proposal {i+1}: {"ABC"[a]} → {"XYZ"[b]}',font_size=22).to_edge(DOWN)
            self.play(FadeIn(who))
            if i in (2,3):
                if b in lines:self.play(FadeOut(lines[b]))
                held[b]=a;lines[b]=Line(left[a].get_right(),right[b].get_left(),color=GREEN,stroke_width=5)
                self.play(Create(lines[b]))
            elif i==4:pass  # rejected: Y holds C
            else:
                held[b]=a;lines[b]=Line(left[a].get_right(),right[b].get_left(),color=GREEN,stroke_width=5)
                self.play(Create(lines[b]))
            self.play(FadeOut(who))
        self.wait()

class BFSScene(Scene):
    def construct(self):
        self.play(Write(Text('BFS explores distance layers',font_size=34).to_edge(UP)))
        positions={'A':LEFT*4,'B':LEFT*2+UP*1.5,'C':LEFT*2+DOWN*1.5,'D':RIGHT*1+UP*1.5,'E':RIGHT*1+DOWN*1.5,'F':RIGHT*3}
        nodes={k:Circle(radius=.35).move_to(p).add(Text(k,font_size=20).move_to(p)) for k,p in positions.items()}
        edges=[('A','B'),('A','C'),('B','D'),('C','E'),('D','F'),('E','F')]
        links=VGroup(*[Line(positions[a],positions[b],color=GREY_B) for a,b in edges]);self.play(Create(links))
        for k in ['A','B','C','D','E','F']:self.play(FadeIn(nodes[k]))
        for layer in [['A'],['B','C'],['D','E'],['F']]:
            self.play(*[nodes[k][0].animate.set_fill(BLUE,opacity=.45) for k in layer],run_time=.7)
        self.wait()

class WeightedSchedulingScene(Scene):
    def construct(self):
        self.play(Write(Text('Weighted interval scheduling: OPT(j)',font_size=32).to_edge(UP)))
        labels=['j','p(j)','value','skip','take','OPT']
        rows=[['1','0','5','0','5','5'],['2','0','6','5','6','6'],['3','1','5','6','10','10'],['4','3','4','10','14','14'],['5','2','9','14','15','15']]
        table=Table(rows,col_labels=[Text(x,font_size=20) for x in labels],include_outer_lines=True).scale(.6)
        self.play(FadeIn(table))
        for i in range(1,6):
            cell=table.get_cell((i+1,6))
            self.play(Indicate(cell,color=GREEN,scale_factor=1.07),run_time=.5)
        self.wait()

class MaxFlowMinCutScene(Scene):
    def construct(self):
        self.play(Write(Text('Max flow = min cut: a certificate',font_size=33).to_edge(UP)))
        p={'s':LEFT*4,'a':LEFT+UP*1.4,'b':LEFT+DOWN*1.4,'t':RIGHT*3}
        nodes={k:Circle(radius=.35).move_to(v).add(Text(k,font_size=21).move_to(v)) for k,v in p.items()}
        edges=[('s','a',3),('s','b',2),('a','b',1),('a','t',2),('b','t',3)]
        for u,v,c in edges:
            arrow=Arrow(p[u],p[v],buff=.39,stroke_width=3,color=BLUE)
            label=Text(str(c),font_size=18).move_to(arrow.get_center()+UP*.22)
            self.play(Create(arrow),FadeIn(label),run_time=.38)
        self.play(*[FadeIn(obj) for obj in nodes.values()])
        certificate=Text('flow 5 = cut capacity (3 + 2) = 5',font_size=26,color=GREEN).to_edge(DOWN)
        self.play(Write(certificate));self.wait()


class DijkstraProofScene(Scene):
    """Original directed example showing settling order under nonnegative edges."""
    def construct(self):
        self.play(Write(Text('Dijkstra: settled distances stay optimal', font_size=30).to_edge(UP)))
        coords={'A':LEFT*4.6,'B':LEFT*1.5+UP*1.35,'C':LEFT*1.5+DOWN*1.35,
                'D':RIGHT*1.4+UP*.7,'E':RIGHT*4.4}
        es=[('A','B',4),('A','C',1),('C','B',2),('B','D',1),('C','D',5),('D','E',3),('B','E',7)]
        for a,b,w in es:
            ar=Arrow(coords[a],coords[b],buff=.36,stroke_width=2.2,max_tip_length_to_length_ratio=.12,color=GREY_B)
            self.play(Create(ar),FadeIn(Text(str(w),font_size=15).move_to(ar.get_center()+UP*.15)),run_time=.20)
        circles={k:Circle(radius=.33,color=BLUE).set_fill(BLUE,opacity=.13).move_to(pos) for k,pos in coords.items()}
        labels={k:Text(k,font_size=21).move_to(pos) for k,pos in coords.items()}
        self.play(*[FadeIn(v) for v in circles.values()],*[FadeIn(v) for v in labels.values()])
        for node,dist in [('A',0),('C',1),('B',3),('D',4),('E',7)]:
            self.play(circles[node].animate.set_fill(GREEN,opacity=.6),run_time=.44)
            status=Text(f'Settle {node}: shortest distance {dist}',font_size=23).to_edge(DOWN)
            self.play(FadeIn(status));self.wait(.2);self.play(FadeOut(status))
        self.wait()

class SubsetCapacityScene(Scene):
    """Visualize subset-sum's second state dimension; values are authored."""
    def construct(self):
        title=Text('Subset sum: OPT(item, capacity)',font_size=32).to_edge(UP)
        self.play(Write(title))
        weights=[3,4,6,7];W=11
        grid=[[0]*(W+1)]
        for weight in weights:
            old=grid[-1]
            grid.append([max(old[c],weight+old[c-weight] if c>=weight else 0) for c in range(W+1)])
        matrix=Matrix(grid,element_to_mobject=lambda x:Integer(x,font_size=19),h_buff=.68,v_buff=.55,bracket_h_buff=.15).scale(.66)
        self.play(FadeIn(matrix))
        for row in range(5):
            marker=Text(f'{row} available items',font_size=21).to_edge(DOWN)
            self.play(FadeIn(marker));self.wait(.35);self.play(FadeOut(marker))
        ans=Text('OPT(4,11) = 11  [4 + 7]',font_size=25,color=GREEN).to_edge(DOWN)
        self.play(Write(ans));self.wait()

class MatchingAugmentScene(Scene):
    """Show reassignment along an augmenting path; not a textbook artwork copy."""
    def construct(self):
        self.play(Write(Text('Bipartite matching: reverse a previous choice',font_size=29).to_edge(UP)))
        L={k:LEFT*3+UP*(2.1-i*1.6) for i,k in enumerate('ABC')}
        R={k:RIGHT*3+UP*(2.1-i*1.6) for i,k in enumerate('123')}
        for k,p in {**L,**R}.items():
            obj=VGroup(Circle(radius=.35,color=BLUE if k.isalpha() else GREEN).move_to(p),Text(k,font_size=20).move_to(p))
            self.play(FadeIn(obj),run_time=.16)
        first=Line(L['A'],R['1'],color=GREEN,stroke_width=5)
        self.play(Create(first))
        status=Text('B needs 1. Undo A–1, reroute A to 2.',font_size=22).to_edge(DOWN)
        self.play(Write(status),FadeOut(first))
        second=Line(L['A'],R['2'],color=GREEN,stroke_width=5)
        third=Line(L['B'],R['1'],color=GREEN,stroke_width=5)
        self.play(Create(second),Create(third))
        self.play(Create(Line(L['C'],R['3'],color=GREEN,stroke_width=5)))
        self.play(Transform(status,Text('3 matched pairs = maximum possible',font_size=22,color=GREEN).to_edge(DOWN)))
        self.wait()
