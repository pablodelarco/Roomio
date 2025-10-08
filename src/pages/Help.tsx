import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail, Phone, MessageCircle } from "lucide-react";

export default function Help() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions and get support
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Mail className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Email Support</CardTitle>
            <CardDescription>Get help via email</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">support@roomio.com</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Phone className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Phone Support</CardTitle>
            <CardDescription>Call us directly</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Live Chat</CardTitle>
            <CardDescription>Chat with our team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Available 9am-5pm EST</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <CardTitle>Frequently Asked Questions</CardTitle>
          </div>
          <CardDescription>Common questions about Roomio</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I add a new apartment?</AccordionTrigger>
              <AccordionContent>
                Navigate to the Apartments page and click the "Add Apartment" button. Fill in the required information such as address, number of rooms, and rent amount.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How do I manage tenant information?</AccordionTrigger>
              <AccordionContent>
                Go to the Tenants page where you can view, add, edit, or remove tenant information. You can also assign tenants to specific apartments.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How do I track payments?</AccordionTrigger>
              <AccordionContent>
                The Payments page allows you to record and track all rental payments. You can see payment history, pending payments, and generate payment reports.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>How do I generate reports?</AccordionTrigger>
              <AccordionContent>
                Visit the Reports page to generate various financial and occupancy reports. You can customize date ranges and export reports for your records.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>How do I manage bills and expenses?</AccordionTrigger>
              <AccordionContent>
                The Bills page lets you record and track all property-related expenses such as utilities, maintenance, and taxes. You can categorize bills and monitor spending.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
