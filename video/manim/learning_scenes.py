"""Original textbook companion Manim scenes. No extracted publisher figures.
Requires community Manim 0.18+ and system LaTeX/FFmpeg for MathTex rendering.
Run: manim -pql learning_scenes.py NormalizeOrderLines
"""
from manim import *


class NormalizeOrderLines(Scene):
    """An authored functional-dependency explanation for database normalization."""
    def construct(self):
        title = Text("Normalize dependencies, not table size", font_size=30).to_edge(UP)
        self.play(Write(title))
        raw = VGroup(
            Text("ORDER_LINE", font_size=24, weight=BOLD),
            Text("order_id   product_id   qty   customer_name", font_size=21),
            Text("101        P5           2     Ana", font_size=19),
            Text("101        P6           1     Ana", font_size=19),
        ).arrange(DOWN, aligned_edge=LEFT, buff=.18)
        box = SurroundingRectangle(raw, color=BLUE, buff=.3)
        self.play(FadeIn(raw),Create(box));self.wait(1)
        dependency = MathTex(r"\mathrm{order\_id}\rightarrow\mathrm{customer\_name}",font_size=31).next_to(box,DOWN,buff=.35)
        self.play(Write(dependency));self.wait(1)
        self.play(FadeOut(box),FadeOut(raw),FadeOut(dependency))
        orders = VGroup(Text("ORDERS",font_size=25,weight=BOLD),Text("order_id | customer_id",font_size=19)).arrange(DOWN)
        lines = VGroup(Text("ORDER_LINES",font_size=25,weight=BOLD),Text("order_id | product_id | qty",font_size=19)).arrange(DOWN)
        customers = VGroup(Text("CUSTOMERS",font_size=25,weight=BOLD),Text("customer_id | name",font_size=19)).arrange(DOWN)
        parts = VGroup(orders,lines,customers).arrange(DOWN,buff=.45)
        self.play(LaggedStart(*[FadeIn(x,shift=DOWN*.15) for x in parts],lag_ratio=.3))
        self.wait(1)
        note=Text("Check candidate keys and lossless joins",font_size=24).to_edge(DOWN)
        self.play(Write(note));self.wait(1.5)


class TransactionLostUpdate(Scene):
    """Animated two-transaction interleaving, with original sample values."""
    def construct(self):
        title=Text("A lost update under concurrent transactions",font_size=29).to_edge(UP)
        t1=Text("T1: restock +1",font_size=25).move_to(LEFT*3+UP*1.5)
        t2=Text("T2: sale -2",font_size=25).move_to(RIGHT*3+UP*1.5)
        self.play(Write(title),Write(t1),Write(t2))
        stock=VGroup(Text("Stored stock",font_size=23),DecimalNumber(10,num_decimal_places=0,font_size=50)).arrange(DOWN).move_to(ORIGIN)
        self.play(FadeIn(stock));self.wait(.7)
        a=Text("T1 reads 10",font_size=22).next_to(t1,DOWN)
        b=Text("T2 reads 10",font_size=22).next_to(t2,DOWN)
        self.play(FadeIn(a),FadeIn(b));self.wait(.5)
        self.play(stock[1].animate.set_value(11));self.wait(.4)
        self.play(stock[1].animate.set_value(8));self.wait(.6)
        warning=Text("Expected 9; stored 8 → one update lost",font_size=25,color=RED).to_edge(DOWN)
        self.play(FadeIn(warning));self.wait(1.3)


class TDUpdate(Scene):
    """A sample TD(0) bootstrapping calculation from original teaching values."""
    def construct(self):
        title=Text("Temporal-difference prediction",font_size=33).to_edge(UP)
        eqs=VGroup(
            MathTex(r"\delta = r+\gamma V(s')-V(s)"),
            MathTex(r"=1+(0.9)(4)-2=2.6"),
            MathTex(r"V_{new}(s)=2+0.3(2.6)=2.78")
        ).arrange(DOWN,buff=.7).move_to(ORIGIN)
        self.play(Write(title))
        for i,eq in enumerate(eqs):
            self.play(Write(eq));self.wait(.8)
        box=SurroundingRectangle(eqs[-1],buff=.15,color=GREEN)
        self.play(Create(box));self.wait(1)


class GradientSteps(Scene):
    """Toy 1D gradient descent with a visible learning-rate comparison."""
    def construct(self):
        title=Text("Learning rate changes the trajectory",font_size=30).to_edge(UP)
        axes=Axes(x_range=[-1,7,1],y_range=[0,20,5],x_length=10,y_length=5,axis_config={"include_numbers":True}).shift(DOWN*.25)
        curve=axes.plot(lambda w:(w-3)**2,x_range=[-1,7],color=BLUE)
        self.play(Write(title),Create(axes),Create(curve))
        for eta,color,start in [(0.15,GREEN,0),(0.95,ORANGE,0)]:
            w=start;points=[]
            for _ in range(7):
                points.append(axes.c2p(w,(w-3)**2));w=w-eta*2*(w-3)
            dots=VGroup(*[Dot(p,radius=.065,color=color) for p in points])
            paths=VGroup(*[Line(points[i],points[i+1],color=color,stroke_width=3) for i in range(len(points)-1)])
            label=Text(f"eta = {eta}",font_size=22,color=color).to_corner(DL if eta<.5 else DR)
            self.play(FadeIn(label),LaggedStart(*[Create(l) for l in paths],lag_ratio=.15),FadeIn(dots));self.wait(.6)
