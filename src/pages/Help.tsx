import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Book, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Help() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-muted-foreground">
          Get assistance with StayWell Property Manager
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Book className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Learn how to use all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                View Docs
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageCircle className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Live Chat</CardTitle>
            <CardDescription>
              Chat with our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Mail className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Email Support</CardTitle>
            <CardDescription>
              Send us your questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:support@roomiorentals.com">
                Send Email
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">How do I add a new tenant?</h3>
            <p className="text-sm text-muted-foreground">
              Navigate to the Tenants page and click the "Add Tenant" button to create a new tenant record.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How do I track payments?</h3>
            <p className="text-sm text-muted-foreground">
              Go to the Payments page to view all payment records and add new payments for your tenants.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I generate reports?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! Visit the Reports page to view analytics and generate custom reports for your properties.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
